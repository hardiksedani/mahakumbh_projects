"""Document models and helpers for Firebase Firestore."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.db.firestore import new_id, utcnow


class Doc:
    """Dict wrapper providing attribute access for Firestore documents."""

    def __init__(self, data: dict):
        object.__setattr__(self, "_data", dict(data))

    def __getattr__(self, name: str) -> Any:
        if name == "metadata_":
            return self._data.get("metadata", {})
        return self._data.get(name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name == "_data":
            object.__setattr__(self, name, value)
            return
        key = "metadata" if name == "metadata_" else name
        self._data[key] = value

    def to_dict(self) -> dict:
        return dict(self._data)

    @property
    def id(self) -> str:
        return self._data.get("id", "")


def _now() -> str:
    return utcnow().isoformat()


def make_role(name: str, description: str = "") -> dict:
    return {"id": new_id(), "name": name, "description": description, "created_at": _now()}


def make_user(email: str, password_hash: str, full_name: str, role_id: str) -> dict:
    return {
        "id": new_id(), "email": email, "password_hash": password_hash,
        "full_name": full_name, "role_id": role_id, "active": True,
        "created_at": _now(), "updated_at": _now(),
    }


def make_zone(zone_code: str, name: str, latitude: float, longitude: float, capacity: int, risk_weight: float = 1.0) -> dict:
    return {
        "id": new_id(), "zone_code": zone_code, "name": name,
        "latitude": latitude, "longitude": longitude, "capacity": capacity,
        "risk_weight": risk_weight, "metadata": {}, "created_at": _now(),
    }


def make_camera(camera_code: str, zone_id: str, latitude: float, longitude: float, **kwargs) -> dict:
    return {
        "id": new_id(), "camera_code": camera_code, "zone_id": zone_id,
        "latitude": latitude, "longitude": longitude,
        "stream_type": kwargs.get("stream_type", "simulated"),
        "stream_url": kwargs.get("stream_url"),
        "status": kwargs.get("status", "online"),
        "created_at": _now(),
    }


def make_camera_event(camera_id: str, event_type: str, **kwargs) -> dict:
    return {
        "id": new_id(), "camera_id": camera_id,
        "zone_id": kwargs.get("zone_id"),
        "event_type": event_type,
        "severity": kwargs.get("severity", "INFO"),
        "confidence": kwargs.get("confidence", 0.0),
        "latitude": kwargs.get("latitude"),
        "longitude": kwargs.get("longitude"),
        "evidence": kwargs.get("evidence", {}),
        "status": kwargs.get("status", "PENDING_VERIFICATION"),
        "detected_at": kwargs.get("detected_at", _now()),
        "created_at": _now(),
    }


def make_incident(incident_code: str, incident_type: str, **kwargs) -> dict:
    return {
        "id": new_id(), "incident_code": incident_code, "incident_type": incident_type,
        "cluster_id": kwargs.get("cluster_id"),
        "status": kwargs.get("status", "OPEN"),
        "severity": kwargs.get("severity", "INFO"),
        "confidence": kwargs.get("confidence", 0.0),
        "risk_score": kwargs.get("risk_score", 0.0),
        "priority_score": kwargs.get("priority_score", 0.0),
        "latitude": kwargs.get("latitude"),
        "longitude": kwargs.get("longitude"),
        "location_name": kwargs.get("location_name"),
        "evidence_summary": kwargs.get("evidence_summary", {}),
        "ai_recommendation": kwargs.get("ai_recommendation", {}),
        "risk_explanation": kwargs.get("risk_explanation", {}),
        "first_seen": kwargs.get("first_seen", _now()),
        "last_seen": kwargs.get("last_seen", _now()),
        "resolved_at": kwargs.get("resolved_at"),
        "created_at": _now(), "updated_at": _now(),
    }


def make_social_post(**kwargs) -> dict:
    return {
        "id": new_id(),
        "source_id": kwargs.get("source_id"),
        "creator_id": kwargs.get("creator_id"),
        "incident_id": kwargs.get("incident_id"),
        "cluster_id": kwargs.get("cluster_id"),
        "platform": kwargs.get("platform", "instagram"),
        "post_url": kwargs.get("post_url"),
        "caption": kwargs.get("caption"),
        "transcript": kwargs.get("transcript"),
        "ocr_text": kwargs.get("ocr_text"),
        "media_path": kwargs.get("media_path"),
        "extracted_claim": kwargs.get("extracted_claim", {}),
        "urgency_score": kwargs.get("urgency_score", 0.0),
        "relevance_score": kwargs.get("relevance_score", 0.0),
        "social_priority_score": kwargs.get("social_priority_score", 0.0),
        "verification_status": kwargs.get("verification_status", "UNVERIFIED"),
        "engagement": kwargs.get("engagement", {}),
        "location_name": kwargs.get("location_name"),
        "latitude": kwargs.get("latitude"),
        "longitude": kwargs.get("longitude"),
        "location_confidence": kwargs.get("location_confidence", 0.0),
        "posted_at": kwargs.get("posted_at", _now()),
        "created_at": _now(),
    }


def make_shelter(shelter_code: str, zone_id: str, name: str, capacity: int, occupied: int, latitude: float, longitude: float) -> dict:
    return {
        "id": new_id(), "shelter_code": shelter_code, "zone_id": zone_id, "name": name,
        "capacity": capacity, "occupied": occupied,
        "latitude": latitude, "longitude": longitude,
        "status": "open",
    }


def make_response_unit(unit_code: str, unit_type: str, name: str, latitude: float, longitude: float, **kwargs) -> dict:
    return {
        "id": new_id(), "unit_code": unit_code, "unit_type": unit_type, "name": name,
        "latitude": latitude, "longitude": longitude,
        "status": kwargs.get("status", "available"),
        "available": kwargs.get("available", True),
        "metadata": kwargs.get("metadata", {}),
        "updated_at": _now(),
    }


def make_alert(level: str, message: str, **kwargs) -> dict:
    return {
        "id": new_id(), "incident_id": kwargs.get("incident_id"),
        "level": level, "channel": kwargs.get("channel", "dashboard"),
        "message": message, "acknowledged": False,
        "metadata": kwargs.get("metadata", {}),
        "sent_at": _now(),
    }


def make_verification_result(claim: str, status: str, **kwargs) -> dict:
    return {
        "id": new_id(), "incident_id": kwargs.get("incident_id"),
        "social_post_id": kwargs.get("social_post_id"),
        "claim": claim, "status": status,
        "confidence": kwargs.get("confidence", 0.0),
        "evidence": kwargs.get("evidence", {}),
        "reasoning": kwargs.get("reasoning", {}),
        "created_at": _now(),
    }


def make_dispatch(incident_id: str, unit_id: str, **kwargs) -> dict:
    return {
        "id": new_id(), "incident_id": incident_id, "unit_id": unit_id,
        "recommended_by": kwargs.get("recommended_by", "AI"),
        "confirmed_by": kwargs.get("confirmed_by"),
        "status": kwargs.get("status", "RECOMMENDED"),
        "notes": kwargs.get("notes"),
        "created_at": _now(), "confirmed_at": kwargs.get("confirmed_at"),
    }


def make_crowd_prediction(zone_id: str, **kwargs) -> dict:
    return {
        "id": new_id(), "zone_id": zone_id,
        "horizon_minutes": kwargs["horizon_minutes"],
        "predicted_population": kwargs.get("predicted_population"),
        "predicted_density": kwargs.get("predicted_density"),
        "overflow_risk": kwargs.get("overflow_risk", 0.0),
        "model_metadata": kwargs.get("model_metadata", {}),
        "predicted_for": kwargs.get("predicted_for", _now()),
        "created_at": _now(),
    }


def make_crowd_snapshot(zone_id: str, **kwargs) -> dict:
    return {
        "id": new_id(), "zone_id": zone_id,
        "camera_id": kwargs.get("camera_id"),
        "people_count": kwargs.get("people_count", 0),
        "density_score": kwargs.get("density_score", 0.0),
        "growth_rate": kwargs.get("growth_rate", 0.0),
        "inflow": kwargs.get("inflow", 0.0),
        "outflow": kwargs.get("outflow", 0.0),
        "movement_abnormality": kwargs.get("movement_abnormality", 0.0),
        "counter_flow_score": kwargs.get("counter_flow_score", 0.0),
        "fall_score": kwargs.get("fall_score", 0.0),
        "crowd_risk_score": kwargs.get("crowd_risk_score", 0.0),
        "recorded_at": kwargs.get("recorded_at", _now()),
    }


def doc(data: dict) -> Doc:
    return Doc(data)
