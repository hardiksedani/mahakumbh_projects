import math

import uuid

from datetime import datetime, timezone

from typing import Any, Dict, List, Optional



from app.ai.risk.scoring_engine import RiskScoringEngine

from app.core.config import settings

from app.db.document_models import doc, make_alert, make_camera_event, make_incident

from app.db.firestore import FirestoreDB





def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:

    R = 6371

    dlat = math.radians(lat2 - lat1)

    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2

    return R * 2 * math.asin(math.sqrt(a))





class IncidentService:

    def __init__(self):

        self.risk_engine = RiskScoringEngine()



    async def create_from_camera_event(self, db: FirestoreDB, event: dict, camera: dict) -> dict:

        code = f"INC-{uuid.uuid4().hex[:8].upper()}"

        evidence = event.get("evidence") or {}

        risk = self.risk_engine.compute(

            event_severity=event.get("severity", "INFO"),

            confidence=event.get("confidence", 0.0),

            crowd_density=evidence.get("crowd_density_score", 0),

            camera_confirmation=event.get("confidence", 0.0),

            snan_mode=settings.major_snan_mode,

        )

        incident = make_incident(

            code,

            event.get("event_type", "OTHER"),

            status="OPEN",

            severity=event.get("severity", "INFO"),

            confidence=event.get("confidence", 0.0),

            risk_score=risk["risk_score"],

            priority_score=risk["risk_score"],

            latitude=event.get("latitude") or camera.get("latitude"),

            longitude=event.get("longitude") or camera.get("longitude"),

            evidence_summary={"camera_events": [event["id"]], "evidence": evidence},

            risk_explanation=risk,

        )

        await db.create("incidents", incident)

        return incident



    async def list_incidents(self, db: FirestoreDB, status: Optional[str] = None, limit: int = 50) -> List[dict]:

        filters = [("status", "==", status)] if status else None

        items = await db.query("incidents", filters=filters, order_by="priority_score", descending=True, limit=limit)

        return items





class ResponseService:

    async def nearest_units(

        self, db: FirestoreDB, lat: float, lng: float, unit_type: Optional[str] = None, limit: int = 5

    ) -> List[Dict]:

        filters: List[tuple] = [("available", "==", True)]

        if unit_type:

            filters.append(("unit_type", "==", unit_type))

        units = await db.query("response_units", filters=filters)

        scored = []

        for u in units:

            dist = haversine_km(lat, lng, u["latitude"], u["longitude"])

            scored.append({"unit": doc(u), "distance_km": round(dist, 2)})

        scored.sort(key=lambda x: x["distance_km"])

        return scored[:limit]





class CorrelationService:

    async def correlate_cameras(self, db: FirestoreDB, camera: dict, event_type: str, minutes: int = 3) -> Dict:

        from datetime import timedelta

        since = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()

        all_cameras = await db.query("cameras")

        nearby = [

            c for c in all_cameras

            if c["id"] != camera["id"]

            and haversine_km(camera["latitude"], camera["longitude"], c["latitude"], c["longitude"]) < 0.5

        ]

        corroborating = 0

        events_found = []

        for cam in nearby:

            events = await db.query(

                "camera_events",

                filters=[

                    ("camera_id", "==", cam["id"]),

                    ("event_type", "==", event_type),

                ],

            )

            for ev in events:

                if ev.get("detected_at", "") >= since:

                    corroborating += 1

                    events_found.append({"camera_code": cam["camera_code"], "confidence": ev.get("confidence", 0)})

        cross_confidence = min(0.99, 0.5 + corroborating * 0.15) if corroborating else 0.0

        return {

            "corroborating_camera_count": corroborating,

            "cross_camera_confidence": round(cross_confidence, 2),

            "nearby_events": events_found,

        }





class ShelterService:

    async def list_with_occupancy(self, db: FirestoreDB) -> List[Dict]:

        shelters = await db.query("shelters")

        output = []

        for s in shelters:

            pct = (s["occupied"] / s["capacity"] * 100) if s.get("capacity") else 0

            output.append({"shelter": doc(s), "occupancy_pct": round(pct, 1), "overflow_risk": pct > 90})

        return output



    async def check_overflow_alerts(self, db: FirestoreDB) -> List[Dict]:

        alerts = []

        for item in await self.list_with_occupancy(db):

            if item["overflow_risk"]:

                sh = item["shelter"]

                alerts.append({

                    "shelter_code": sh.shelter_code,

                    "occupancy_pct": item["occupancy_pct"],

                    "message": f"SHELTER_OVERFLOW_RISK at {sh.name}",

                })

        return alerts





class AlertService:

    async def create_alert(

        self, db: FirestoreDB, level: str, message: str, incident_id: Optional[str] = None, channel: str = "dashboard"

    ):

        from app.core.websocket_manager import ws_manager

        alert = make_alert(level, message, incident_id=incident_id, channel=channel)

        await db.create("alerts", alert)

        await ws_manager.broadcast("alerts", {

            "type": "ALERT",

            "level": level,

            "message": message,

            "incident_id": incident_id,

        })

        return doc(alert)

