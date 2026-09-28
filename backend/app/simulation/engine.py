import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.core.websocket_manager import ws_manager
from app.db.document_models import make_camera_event
from app.db.firestore import FirestoreDB
from app.services.core_services import AlertService, CorrelationService, IncidentService


SCENARIOS_CATALOG = [
    {
        "id": "MAJOR_SNAN_CANONICAL",
        "title": "Major Shahi Snan 16-Step Canonical Timeline",
        "category": "FULL_LIFECYCLE",
        "description": "Full end-to-end timeline simulating normal monitoring -> crowd surge -> social rumor -> verified fire -> incident response -> resolution.",
    },
    {
        "id": "STAMPEDE_RUMOR_DEBUNK",
        "title": "Stampede Rumor Debunking & Counter-Advisory",
        "category": "SOCIAL_INTELLIGENCE",
        "description": "Viral panic rumor on social media claiming a stampede at Gate 7. Ground cameras show normal flow -> Claim flagged UNVERIFIED -> Automated counter-advisory.",
    },
    {
        "id": "AKHADA_TENT_FIRE",
        "title": "Akhada Tent Structural Fire with QRT Dispatch",
        "category": "MULTI_CAMERA_FUSION",
        "description": "Thermal camera detects flame and smoke at Sadhu Gram Sector 14. Adjacent cameras corroborate via Bayesian fusion. QRT Fire Brigade dispatched.",
    },
    {
        "id": "BOTTLENECK_BRIDGE",
        "title": "Laxman Jhula Bridge Bottleneck Surge",
        "category": "CROWD_SAFETY",
        "description": "Optical flow vectors detect sudden bidirectional compression and counter-flow. Predicted overflow > 88% -> Triggers upstream holding area diversions.",
    },
    {
        "id": "VIP_CONVOY_INCURSION",
        "title": "Restricted Perimeter Unauthorized Vehicle Incursion",
        "category": "PERIMETER_SECURITY",
        "description": "Object detector flags unauthorized vehicle in pedestrian-only sacred bath corridor. Alerts Sector Commander.",
    },
    {
        "id": "WEATHER_DOWNPOUR_SURGE",
        "title": "Sudden Downpour & Holding Shelter Influx",
        "category": "SHELTER_LOGISTICS",
        "description": "Heavy rainfall causes rapid movement into covered Rain Shelters. Occupancy exceeds 92% -> Reroutes devotees to Transit Hall B.",
    },
    {
        "id": "LOST_CHILD_SEARCH",
        "title": "AI Lost Child Facial Feature Search",
        "category": "CITIZEN_SAFETY",
        "description": "Devotee files report of lost 8-year-old child wearing red kurta. Vision camera index locates probable candidate near Ramkund Gate 3.",
    },
    {
        "id": "GHAT_WATER_SURGE",
        "title": "Godavari River Current Velocity Warning",
        "category": "HYDRO_HAZARD",
        "description": "Upstream dam release increases river flow speed beyond safe bathing limits. Smart buoy flags RED hazard -> Lifeguard teams deployed.",
    },
    {
        "id": "HEATSTROKE_CLUSTER",
        "title": "Midday Heat Exhaustion Cluster",
        "category": "MEDICAL_TRIAGE",
        "description": "Multiple collapsed person alerts detected across 2 adjacent cameras in open queue. Automated first aid paramedic motorcycle dispatched.",
    },
    {
        "id": "RECYCLED_HISTORICAL_CLIP",
        "title": "Recycled 2019 Akhada Fire Circulated as 2027",
        "category": "DEEPFAKE_RECYCLED",
        "description": "Social post circulates dramatic fire video. Recycled media engine compares perceptual hashes to 2019 Prayagraj archive -> Issues non-accusatory contextual note.",
    },
    {
        "id": "COORDINATED_BOT_SPIKE",
        "title": "Coordinated Misinformation Bot Attack",
        "category": "THREAT_INTELLIGENCE",
        "description": "Sudden burst of 30 identical panic messages from low-trust unverified accounts within 90 seconds. Velocity threshold triggered -> Placed under investigation.",
    },
]


class SimulationEngine:
    """Enhanced Multi-Scenario Simulation Engine for Simhastha Kumbh 2027.
    Supports 11 specialized scenarios, dynamic speed control (0.5x, 1x, 2x, 5x),
    and pause/resume controls for live demonstrations.
    """

    TIMELINE = [
        (0, "normal", "Normal monitoring conditions across Nashik-Trimbak sectors"),
        (2, "crowd_rise", "Crowd levels steadily rising at Ramkund and Panchvati ghats"),
        (4, "transport", "Transport hub inflow accelerating at Nashik Road Station"),
        (5, "social", "Social media posts surging with devotees sharing live updates"),
        (6, "crowd_risk", "Crowd density index entering ELEVATED state in Sector 4"),
        (7, "social_cluster", "Congestion reports clustering around Gate 7 bottleneck"),
        (8, "abnormal_movement", "Optical flow camera detects localized counter-flow turbulence"),
        (9, "risk_red", "Composite Risk Score crosses 75: ORANGE/RED threshold triggered"),
        (10, "ai_recommend", "AI Decision Support generates SOP diversion recommendation"),
        (11, "fire", "Thermal bloom detected at tent sector CAM-782"),
        (12, "fire_verify", "Cross-camera Bayesian fusion corroborates thermal signature (92%)"),
        (13, "fire_unit", "Nearest QRT Fire Unit 2 auto-identified and assigned"),
        (14, "misinfo", "Unverified panic post: 'Stampede at Gate 7!!' appears on social"),
        (15, "unverified", "Verification engine checks ground cameras: No stampede observed -> Flagged UNVERIFIED"),
        (16, "official_alert", "Automated counter-messaging and official advisory pushed to Mela app"),
        (18, "resolved", "All sector parameters return to GREEN baseline safe state"),
    ]

    def __init__(self):
        self.running = False
        self.paused = False
        self.speed_multiplier = 1.0
        self.current_step = 0
        self.active_scenario = "MAJOR_SNAN_CANONICAL"
        self._task: Optional[asyncio.Task] = None
        self.incident_service = IncidentService()
        self.alert_service = AlertService()
        self.correlation = CorrelationService()

    @property
    def status(self) -> Dict[str, Any]:
        step_idx = min(self.current_step, len(self.TIMELINE) - 1)
        step_info = self.TIMELINE[step_idx]
        return {
            "running": self.running,
            "paused": self.paused,
            "speed_multiplier": self.speed_multiplier,
            "active_scenario": self.active_scenario,
            "current_step": self.current_step,
            "total_steps": len(self.TIMELINE),
            "major_snan_mode": settings.major_snan_mode,
            "message": step_info[2],
            "event": step_info[1],
            "data_provenance": "DEMO / SIMULATED DATA",
        }

    def list_scenarios(self) -> List[Dict[str, Any]]:
        return SCENARIOS_CATALOG

    def set_speed(self, multiplier: float) -> float:
        self.speed_multiplier = max(0.25, min(10.0, float(multiplier)))
        return self.speed_multiplier

    def pause(self) -> Dict[str, Any]:
        if self.running:
            self.paused = True
        return self.status

    def resume(self) -> Dict[str, Any]:
        if self.running:
            self.paused = False
        return self.status

    async def start(self, db: FirestoreDB, scenario_id: str = "MAJOR_SNAN_CANONICAL"):
        if self.running:
            return self.status
        self.running = True
        self.paused = False
        self.active_scenario = scenario_id
        settings.major_snan_mode = True
        self._task = asyncio.create_task(self._run_timeline(db))
        return self.status

    async def stop(self):
        self.running = False
        self.paused = False
        if self._task:
            self._task.cancel()
        settings.major_snan_mode = False
        return self.status

    async def reset(self, db: FirestoreDB):
        await self.stop()
        self.current_step = 0
        self.paused = False
        self.speed_multiplier = 1.0
        self.active_scenario = "MAJOR_SNAN_CANONICAL"
        settings.major_snan_mode = False
        return self.status

    async def _run_timeline(self, db: FirestoreDB):
        for i, (minute, event, message) in enumerate(self.TIMELINE):
            while self.paused and self.running:
                await asyncio.sleep(0.5)

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
                "speed_multiplier": self.speed_multiplier,
            })

            # Base step delay divided by speed multiplier (e.g. 8s / 2x = 4s)
            base_sleep = max(1.0, 8.0 / max(self.speed_multiplier, 0.1))
            await asyncio.sleep(base_sleep)

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

    # -------------------------------------------------------------
    # Specialized Injections for Specific Demos & Pitch Scenarios
    # -------------------------------------------------------------

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
        new_confidence = corr.get("cross_camera_confidence") or incident.get("confidence", 0)

        await db.update("incidents", incident["id"], {
            "evidence_summary": evidence,
            "confidence": new_confidence,
        })
        await self.alert_service.create_alert(db, "CRITICAL", f"Thermal bloom & fire detected at {camera['camera_code']}", incident["id"])
        await ws_manager.broadcast("cameras", {
            "type": "CRITICAL_INCIDENT",
            "incident_id": incident["id"],
            "event_type": "FIRE",
            "risk_score": incident.get("risk_score", 85),
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
                evidence={"people_count": 2800, "crowd_density_score": 0.92, "crowd_risk_score": 78},
            )
            await db.create("camera_events", event)
        await ws_manager.broadcast("crowd", {"type": "CROWD_SURGE", "message": "Crowd surge detected near Ramkund sector"})

    async def inject_misinformation(self, db: FirestoreDB):
        from app.services.social_service import SocialService
        social = SocialService()
        await social.ingest_and_analyze(db, {
            "caption": "STAMPEDE at Gate 7!! Everyone running for their lives!! (UNVERIFIED)",
            "platform": "instagram",
            "creator_handle": "panic_reporter_27",
            "verified_account": False,
        })

    async def inject_recycled_clip(self, db: FirestoreDB):
        from app.services.social_service import SocialService
        social = SocialService()
        post = await social.ingest_and_analyze(db, {
            "caption": "Big cylinder blast and tent fire at Kumbh! Watch this shocking video!",
            "platform": "instagram",
            "creator_handle": "viral_kumbh_clips",
            "media_hash": "e8f1a299ff01",
        })
        return post

    async def inject_bottleneck_bridge(self, db: FirestoreDB):
        cameras = await db.query("cameras", limit=1)
        if cameras:
            camera = cameras[0]
            event = make_camera_event(
                camera["id"], "CROWD",
                zone_id=camera.get("zone_id"),
                severity="CRITICAL", confidence=0.91,
                latitude=camera["latitude"], longitude=camera["longitude"],
                evidence={"people_count": 4200, "counter_flow_score": 0.88, "crowd_density_score": 0.96},
            )
            await db.create("camera_events", event)
            await self.alert_service.create_alert(db, "CRITICAL", f"Severe bottleneck counter-flow at {camera['camera_code']}", event["id"])

    async def _boost_risk_alert(self, db: FirestoreDB):
        await self.alert_service.create_alert(db, "CRITICAL", "Risk level RED: Major Snan operational capacity threshold exceeded.")

    async def _official_alert(self, db: FirestoreDB):
        await self.alert_service.create_alert(db, "HIGH", "Official Advisory: Situation normal across ghats. Follow designated queue barricades.")


simulation_engine = SimulationEngine()
