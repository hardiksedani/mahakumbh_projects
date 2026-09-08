import math

from datetime import datetime, timedelta, timezone

from typing import Any, Dict, List, Optional



from app.ai.providers.factory import get_embedding_provider, get_llm_provider

from app.db.firestore import FirestoreDB





class VerificationEngine:

    """Evidence-based claim verification engine."""



    def __init__(self):

        self.embedder = get_embedding_provider()

        self.llm = get_llm_provider()



    async def verify_claim(

        self,

        db: FirestoreDB,

        claim: str,

        incident_type: Optional[str] = None,

        latitude: Optional[float] = None,

        longitude: Optional[float] = None,

        social_post_id: Optional[str] = None,

    ) -> Dict[str, Any]:

        camera_evidence = await self._nearby_camera_evidence(db, latitude, longitude, incident_type)

        social_evidence = await self._similar_social_reports(db, claim, latitude, longitude)

        official = await self._check_official_contradiction(db, incident_type, latitude, longitude)



        supporting = len([e for e in camera_evidence if e.get("supports")])

        contradicting = len([e for e in camera_evidence if e.get("contradicts")])



        if supporting >= 2:

            status = "VERIFIED"

            confidence = min(0.95, 0.6 + supporting * 0.15)

        elif supporting == 1:

            status = "LIKELY"

            confidence = 0.65

        elif contradicting >= 2:

            status = "CONTRADICTED"

            confidence = 0.8

        elif contradicting == 1:

            status = "UNVERIFIED"

            confidence = 0.55

        elif social_evidence.get("cluster_count", 0) >= 3 and not camera_evidence:

            status = "UNDER_INVESTIGATION"

            confidence = 0.5

        else:

            status = "UNVERIFIED"

            confidence = 0.4



        reasoning = {

            "camera_events_found": len(camera_evidence),

            "supporting_cameras": supporting,

            "contradicting_cameras": contradicting,

            "similar_social_reports": social_evidence.get("cluster_count", 0),

            "official_status": official,

        }



        return {

            "claim": claim,

            "status": status,

            "confidence": round(confidence, 2),

            "evidence": {

                "camera_evidence": camera_evidence,

                "social_evidence": social_evidence,

            },

            "reasoning": reasoning,

            "social_post_id": social_post_id,

        }



    async def _nearby_camera_evidence(

        self, db: FirestoreDB, lat: Optional[float], lng: Optional[float], incident_type: Optional[str]

    ) -> List[Dict]:

        if lat is None or lng is None:

            return []

        since = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()

        events = await db.query("camera_events")

        cameras = {c["id"]: c for c in await db.query("cameras")}

        evidence = []

        type_map = {"FIRE": ["FIRE"], "CROWD": ["CROWD"], "MEDICAL": ["MEDICAL", "ACCIDENT"]}

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

                "camera_code": camera["camera_code"],

                "event_type": event.get("event_type"),

                "confidence": event.get("confidence", 0),

                "distance_km": round(dist, 2),

                "supports": supports,

                "contradicts": (

                    incident_type is not None

                    and event.get("event_type") not in expected

                    and event.get("confidence", 0) > 0.5

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

            if sim > 0.75:

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

