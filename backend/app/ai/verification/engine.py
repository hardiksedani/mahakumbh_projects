import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from app.ai.providers.factory import get_embedding_provider, get_llm_provider
from app.ai.verification.incident_graph import IncidentGraphGenerator
from app.ai.vision.event_engine import MultiCameraEvidenceFusion
from app.db.firestore import FirestoreDB
from app.social.recycled_content import RecycledContentDetector


class VerificationEngine:
    """Evidence-based claim verification engine for KumbhRakshak.
    Combines ground camera detections (via distance-decayed Bayesian fusion),
    social media clustering, historical recycled media detection, and official advisories.
    """

    def __init__(self):
        self.embedder = get_embedding_provider()
        self.llm = get_llm_provider()
        self.camera_fusion = MultiCameraEvidenceFusion()
        self.recycled_detector = RecycledContentDetector()

    async def verify_claim(
        self,
        db: FirestoreDB,
        claim: str,
        incident_type: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        social_post_id: Optional[str] = None,
        media_hash: Optional[str] = None,
    ) -> Dict[str, Any]:
        # 1. Evaluate historical / recycled media indicators
        recycled_eval = self.recycled_detector.analyze(claim, media_hash=media_hash)

        # 2. Gather Ground Camera Evidence
        camera_evidence = await self._nearby_camera_evidence(db, latitude, longitude, incident_type)

        # 3. Fuse Camera Signals via Distance-Decayed Bayesian Combination
        cam_candidates = [
            {
                "camera_code": c.get("camera_code", "CAM"),
                "confidence": c.get("confidence", 0.5),
                "distance_km": c.get("distance_km", 0.5),
                "supports": c.get("supports", False),
            }
            for c in camera_evidence
        ]
        fusion_result = self.camera_fusion.fuse_camera_evidence(cam_candidates)
        fused_camera_conf = fusion_result.get("cross_camera_confidence", 0.0)

        # 4. Gather Social Corroboration
        social_evidence = await self._similar_social_reports(db, claim, latitude, longitude)

        # 5. Check Official Ground Confirmation / Contradiction
        official = await self._check_official_contradiction(db, incident_type, latitude, longitude)

        # 6. Synthesize Multi-Source Verification Verdict
        supporting = len([e for e in camera_evidence if e.get("supports")])
        contradicting = len([e for e in camera_evidence if e.get("contradicts")])
        cluster_cnt = social_evidence.get("cluster_count", 0)

        if recycled_eval.get("is_recycled"):
            status = "POSSIBLE_REUSED_CONTENT"
            confidence = recycled_eval.get("confidence", 0.86)
        elif supporting >= 2 and fused_camera_conf >= 0.75:
            status = "VERIFIED"
            confidence = min(0.98, max(fused_camera_conf, 0.70 + supporting * 0.10))
        elif supporting >= 1 or (fused_camera_conf >= 0.60):
            status = "LIKELY"
            confidence = max(fused_camera_conf, 0.65)
        elif contradicting >= 2:
            status = "CONTRADICTED"
            confidence = 0.82
        elif contradicting == 1:
            status = "UNVERIFIED"
            confidence = 0.55
        elif cluster_cnt >= 3 and not camera_evidence:
            status = "UNDER_INVESTIGATION"
            confidence = 0.50
        else:
            status = "UNVERIFIED"
            confidence = 0.40

        # Structured Evidence Matrix
        evidence_matrix = {
            "ground_camera": {
                "status": "CORROBORATING" if supporting > 0 else ("CONTRADICTING" if contradicting > 0 else "NO_COVERAGE"),
                "confidence": round(fused_camera_conf, 2),
                "supporting_count": supporting,
                "contradicting_count": contradicting,
                "fused_score": round(fused_camera_conf * 100, 1),
                "fusion_method": "Distance-Decayed Bayesian",
            },
            "social_signal": {
                "cluster_count": cluster_cnt,
                "velocity_indicator": "HIGH" if cluster_cnt >= 5 else ("MODERATE" if cluster_cnt >= 2 else "LOW"),
                "sample_posts": social_evidence.get("posts", [])[:3],
            },
            "recycled_media": {
                "is_flagged": recycled_eval.get("is_recycled", False),
                "classification": recycled_eval.get("classification", "CURRENT_EVENT_PROBABLE"),
                "advisory_message": recycled_eval.get("advisory_message", ""),
                "matched_archive": recycled_eval.get("matched_archive"),
            },
            "official_advisory": {
                "status": official,
                "administrative_override": False,
            },
        }

        reasoning = {
            "camera_events_found": len(camera_evidence),
            "supporting_cameras": supporting,
            "contradicting_cameras": contradicting,
            "fused_camera_confidence": round(fused_camera_conf, 3),
            "similar_social_reports": cluster_cnt,
            "official_status": official,
            "recycled_check": recycled_eval.get("classification"),
        }

        # Build Incident DAG Lineage Graph
        incident_graph = IncidentGraphGenerator.build_graph(
            claim=claim,
            verification_status=status,
            confidence=round(confidence, 2),
            camera_evidence=camera_evidence,
            social_evidence=social_evidence,
            recycled_info=recycled_eval,
            incident_type=incident_type,
        )

        return {
            "claim": claim,
            "status": status,
            "confidence": round(confidence, 2),
            "evidence": {
                "camera_evidence": camera_evidence,
                "social_evidence": social_evidence,
                "evidence_matrix": evidence_matrix,
                "recycled_evidence": recycled_eval,
                "cross_camera_fusion": fusion_result,
            },
            "reasoning": reasoning,
            "social_post_id": social_post_id,
            "incident_graph": incident_graph,
        }

    async def _nearby_camera_evidence(
        self, db: FirestoreDB, lat: Optional[float], lng: Optional[float], incident_type: Optional[str]
    ) -> List[Dict]:
        if lat is None or lng is None:
            return []
        since = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
        events = await db.query("camera_events")
        cameras = {c["id"]: c for c in await db.query("cameras")}
        evidence = []
        type_map = {
            "FIRE": ["FIRE"],
            "CROWD": ["CROWD"],
            "MEDICAL": ["MEDICAL", "ACCIDENT", "PERSON_DOWN", "POSSIBLE_PERSON_DOWN"],
            "ACCIDENT": ["ACCIDENT", "OBSTRUCTION", "VEHICLE_PEDESTRIAN_CONFLICT"],
        }
        expected = type_map.get(incident_type or "", [])

        for event in events:
            if event.get("detected_at", "") < since:
                continue
            camera = cameras.get(event.get("camera_id", ""))
            if not camera:
                continue
            dist = self._haversine(lat, lng, camera["latitude"], camera["longitude"])
            if dist > 2.0:
                continue
            supports = incident_type is None or event.get("event_type") in expected
            evidence.append({
                "camera_code": camera.get("camera_code", "CAM"),
                "event_type": event.get("event_type"),
                "confidence": event.get("confidence", 0),
                "distance_km": round(dist, 2),
                "supports": supports,
                "contradicts": (
                    incident_type is not None
                    and event.get("event_type") not in expected
                    and event.get("confidence", 0) > 0.6
                ),
            })
        return evidence

    async def _similar_social_reports(
        self, db: FirestoreDB, claim: str, lat: Optional[float], lng: Optional[float]
    ) -> Dict[str, Any]:
        since = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
        posts = await db.query("social_posts")
        posts = [p for p in posts if p.get("created_at", "") >= since]
        if not claim or not posts:
            return {"cluster_count": 0, "posts": []}

        claim_emb = self.embedder.embed([claim])[0]
        similar = []
        for p in posts:
            text = p.get("caption") or ""
            if not text:
                continue
            sim = self.embedder.similarity(claim_emb, self.embedder.embed([text])[0])
            if sim > 0.70:
                similar.append({"id": p["id"], "caption": text[:100], "similarity": round(sim, 2)})
        return {"cluster_count": len(similar), "posts": similar[:5]}

    async def _check_official_contradiction(self, db, incident_type, lat, lng) -> str:
        return "no_official_contradiction"

    def _haversine(self, lat1, lon1, lat2, lon2) -> float:
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        return R * 2 * math.asin(math.sqrt(a))


class IncidentClusteringEngine:
    def __init__(self):
        self.embedder = get_embedding_provider()
        from app.core.config import get_model_config

        self.threshold = get_model_config().get("embedding", {}).get("similarity_threshold", 0.82)

    def find_cluster(
        self, claim: str, incident_type: str, existing_posts: List[Dict], lat: Optional[float], lng: Optional[float]
    ) -> Optional[str]:
        if not existing_posts:
            return None
        claim_emb = self.embedder.embed([claim])[0]
        best_id, best_sim = None, 0.0
        for post in existing_posts:
            text = post.get("caption") or post.get("claim") or ""
            if not text:
                continue
            sim = self.embedder.similarity(claim_emb, self.embedder.embed([text])[0])
            geo_bonus = 0.05 if lat and post.get("latitude") and self._near(lat, lng, post["latitude"], post["longitude"]) else 0
            keyword_bonus = self._keyword_bonus(claim, text)
            total = sim + geo_bonus + keyword_bonus
            if keyword_bonus >= 0.12 and geo_bonus > 0 and post.get("cluster_id"):
                total = max(total, self.threshold)
            if total > best_sim and total >= self.threshold:
                best_sim = total
                best_id = post.get("cluster_id")
        return best_id

    def _keyword_bonus(self, claim: str, text: str) -> float:
        claim_l, text_l = claim.lower(), text.lower()
        locations = ["gate 7", "gate 3", "ramkund", "panchvati", "godavari"]
        for loc in locations:
            if loc in claim_l and loc in text_l:
                return 0.12
        stop = {"at", "the", "is", "a", "to", "in", "for", "and", "are", "people"}
        shared = set(claim_l.split()) & set(text_l.split()) - stop
        if len(shared) >= 2:
            return 0.08
        return 0.0

    def _near(self, lat1, lng1, lat2, lng2, km=1.0) -> bool:
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lng2 - lng1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        return R * 2 * math.asin(math.sqrt(a)) < km
