import asyncio

from datetime import datetime, timezone

from typing import Any, Dict, Optional



from app.core.config import settings

from app.core.websocket_manager import ws_manager

from app.db.document_models import make_camera_event

from app.db.firestore import FirestoreDB

from app.services.core_services import AlertService, CorrelationService, IncidentService





class SimulationEngine:

    """Major Snan timeline simulation for hackathon demo."""



    TIMELINE = [

        (0, "normal", "Normal monitoring conditions"),

        (2, "crowd_rise", "Crowd levels rising at major ghats"),

        (4, "transport", "Transport inflow increasing"),

        (5, "social", "Social media reports increasing"),

        (6, "crowd_risk", "Crowd risk score rising"),

        (7, "social_cluster", "Congestion reports clustering at Gate 7"),

        (8, "abnormal_movement", "Camera detects abnormal movement"),

        (9, "risk_red", "Risk level RED"),

        (10, "ai_recommend", "AI recommends response deployment"),

        (11, "fire", "Mock fire event injected"),

        (12, "fire_verify", "Nearby cameras verify fire"),

        (13, "fire_unit", "Nearest fire unit identified"),

        (14, "misinfo", "Misleading social post appears"),

        (15, "unverified", "Verification marks claim UNVERIFIED"),

        (16, "official_alert", "Official alert generated"),

        (18, "resolved", "Incident resolved"),

    ]



    def __init__(self):

        self.running = False

        self.current_step = 0

        self._task: Optional[asyncio.Task] = None

        self.incident_service = IncidentService()

        self.alert_service = AlertService()

        self.correlation = CorrelationService()



    @property

    def status(self) -> Dict[str, Any]:

        step_info = self.TIMELINE[min(self.current_step, len(self.TIMELINE) - 1)]

        return {

            "running": self.running,

            "current_step": self.current_step,

            "total_steps": len(self.TIMELINE),

            "major_snan_mode": settings.major_snan_mode,

            "message": step_info[2],

            "event": step_info[1],

        }



    async def start(self, db: FirestoreDB):

        if self.running:

            return self.status

        self.running = True

        settings.major_snan_mode = True

        self._task = asyncio.create_task(self._run_timeline(db))

        return self.status



    async def stop(self):

        self.running = False

        if self._task:

            self._task.cancel()

        settings.major_snan_mode = False

        return self.status



    async def reset(self, db: FirestoreDB):

        await self.stop()

        self.current_step = 0

        settings.major_snan_mode = False

        return self.status



    async def _run_timeline(self, db: FirestoreDB):

        for i, (minute, event, message) in enumerate(self.TIMELINE):

            if not self.running:

                break

            self.current_step = i

            await self._execute_event(db, event)

            await ws_manager.broadcast("incidents", {

                "type": "SIMULATION_STEP",

                "step": i,

                "event": event,

                "message": message,

                "major_snan_mode": True,

            })

            await asyncio.sleep(8)



    async def _execute_event(self, db: FirestoreDB, event: str):

        handlers = {

            "fire": self.inject_fire,

            "crowd_rise": self.inject_crowd,

            "misinfo": self.inject_misinformation,

            "risk_red": self._boost_risk_alert,

            "official_alert": self._official_alert,

        }

        handler = handlers.get(event)

        if handler:

            await handler(db)



    async def inject_fire(self, db: FirestoreDB, camera_code: str = "CAM-782"):

        camera = await db.get_one("cameras", [("camera_code", "==", camera_code)])

        if not camera:

            cameras = await db.query("cameras", limit=1)

            camera = cameras[0] if cameras else None

        if not camera:

            return

        event = make_camera_event(

            camera["id"], "FIRE",

            zone_id=camera.get("zone_id"),

            severity="CRITICAL", confidence=0.94,

            latitude=camera["latitude"], longitude=camera["longitude"],

            evidence={"smoke_confidence": 0.91, "people_count": 140, "fire_confidence": 0.88},

            status="PENDING_VERIFICATION",

        )

        await db.create("camera_events", event)

        incident = await self.incident_service.create_from_camera_event(db, event, camera)

        corr = await self.correlation.correlate_cameras(db, camera, "FIRE")

        evidence = incident.get("evidence_summary", {})

        evidence["correlation"] = corr

        new_confidence = corr["cross_camera_confidence"] or incident.get("confidence", 0)

        await db.update("incidents", incident["id"], {

            "evidence_summary": evidence,

            "confidence": new_confidence,

        })

        await self.alert_service.create_alert(db, "CRITICAL", f"Fire detected at {camera['camera_code']}", incident["id"])

        await ws_manager.broadcast("cameras", {

            "type": "CRITICAL_INCIDENT",

            "incident_id": incident["id"],

            "event_type": "FIRE",

            "risk_score": incident.get("risk_score", 0),

            "camera_code": camera["camera_code"],

        })



    async def inject_crowd(self, db: FirestoreDB):

        cameras = await db.query("cameras", limit=3)

        for camera in cameras:

            event = make_camera_event(

                camera["id"], "CROWD",

                zone_id=camera.get("zone_id"),

                severity="HIGH", confidence=0.82,

                latitude=camera["latitude"], longitude=camera["longitude"],

                evidence={"people_count": 2500, "crowd_density_score": 0.92, "crowd_risk_score": 78},

            )

            await db.create("camera_events", event)

        await ws_manager.broadcast("crowd", {"type": "CROWD_SURGE", "message": "Crowd surge detected"})






    async def inject_misinformation(self, db: FirestoreDB):

        from app.services.social_service import SocialService

        social = SocialService()

        await social.ingest_and_analyze(db, {

            "caption": "STAMPEDE at Gate 7!! Everyone running!! (UNVERIFIED - no camera evidence)",

            "platform": "instagram",

            "creator_handle": "panic_poster",

        })



    async def _boost_risk_alert(self, db: FirestoreDB):

        await self.alert_service.create_alert(db, "CRITICAL", "Risk level RED - Major Snan high alert")



    async def _official_alert(self, db: FirestoreDB):

        await self.alert_service.create_alert(db, "HIGH", "Official: Situation under control. Follow volunteer guidance.")





simulation_engine = SimulationEngine()

