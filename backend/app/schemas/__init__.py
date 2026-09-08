"""Pydantic schemas for KumbhRakshak API."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# Auth
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    active: bool

    model_config = {"from_attributes": True}


# Zone / Camera
class ZoneResponse(BaseModel):
    id: str
    zone_code: str
    name: str
    latitude: float
    longitude: float
    capacity: int
    risk_weight: float

    model_config = {"from_attributes": True}


class CameraResponse(BaseModel):
    id: str
    camera_code: str
    zone_id: Optional[str] = None
    latitude: float
    longitude: float
    stream_type: str
    stream_url: Optional[str]
    status: str

    model_config = {"from_attributes": True}


class CameraEventCreate(BaseModel):
    camera_id: str
    zone_id: Optional[str] = None
    event_type: str
    severity: str = "INFO"
    confidence: float = 0.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    evidence: Dict[str, Any] = Field(default_factory=dict)
    status: str = "PENDING_VERIFICATION"


class CameraEventResponse(BaseModel):
    id: str
    camera_id: str
    zone_id: Optional[str] = None
    event_type: str
    severity: str
    confidence: float
    latitude: Optional[float]
    longitude: Optional[float]
    evidence: Dict[str, Any]
    status: str
    detected_at: datetime

    model_config = {"from_attributes": True}


# Incident
class IncidentCreate(BaseModel):
    incident_type: str
    severity: str = "INFO"
    confidence: float = 0.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    evidence_summary: Dict[str, Any] = Field(default_factory=dict)


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = None


class IncidentResponse(BaseModel):
    id: str
    incident_code: str
    incident_type: str
    status: str
    severity: str
    confidence: float
    risk_score: float
    priority_score: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    evidence_summary: Dict[str, Any] = Field(default_factory=dict)
    ai_recommendation: Dict[str, Any] = Field(default_factory=dict)
    risk_explanation: Dict[str, Any] = Field(default_factory=dict)
    first_seen: datetime
    last_seen: datetime

    model_config = {"from_attributes": True}


# Social
class SocialPostIngest(BaseModel):
    platform: str = "instagram"
    post_url: Optional[str] = None
    caption: Optional[str] = None
    transcript: Optional[str] = None
    creator_handle: Optional[str] = None
    posted_at: Optional[datetime] = None
    engagement: Dict[str, Any] = Field(default_factory=dict)


class SocialPostResponse(BaseModel):
    id: str
    platform: str
    post_url: Optional[str] = None
    caption: Optional[str] = None
    transcript: Optional[str] = None
    extracted_claim: Dict[str, Any] = Field(default_factory=dict)
    urgency_score: float
    relevance_score: float
    social_priority_score: float
    verification_status: str
    location_name: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    location_confidence: float
    posted_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class VerifyUrlRequest(BaseModel):
    url: Optional[str] = None
    caption: Optional[str] = None
    transcript: Optional[str] = None
    media_path: Optional[str] = None


class VerifyUrlResponse(BaseModel):
    claim: str
    likely_location: Optional[str]
    likely_event: Optional[str]
    verification_status: str
    confidence: float
    ground_evidence: Dict[str, Any]
    reasoning: str


# Verification
class VerificationAnalyzeRequest(BaseModel):
    social_post_id: Optional[str] = None
    claim: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    incident_type: Optional[str] = None


class VerificationResponse(BaseModel):
    id: str
    claim: Optional[str]
    status: str
    confidence: float
    evidence: Dict[str, Any]
    reasoning: Dict[str, Any]

    model_config = {"from_attributes": True}


# Response units
class ResponseUnitResponse(BaseModel):
    id: str
    unit_code: str
    unit_type: str
    name: str
    latitude: float
    longitude: float
    status: str
    available: bool
    distance_km: Optional[float] = None

    model_config = {"from_attributes": True}


class DispatchRecommendRequest(BaseModel):
    incident_id: str


class DispatchConfirmRequest(BaseModel):
    dispatch_id: str
    notes: Optional[str] = None


# Shelter
class ShelterResponse(BaseModel):
    id: str
    shelter_code: str
    name: str
    capacity: int
    occupied: int
    latitude: float
    longitude: float
    status: str
    occupancy_pct: float = 0.0
    overflow_risk: bool = False

    model_config = {"from_attributes": True}


# Predictions
class PredictionResponse(BaseModel):
    id: str
    zone_id: str
    horizon_minutes: int
    predicted_population: Optional[int]
    predicted_density: Optional[float]
    overflow_risk: float
    predicted_for: Optional[datetime]

    model_config = {"from_attributes": True}


# Alerts
class AlertCreate(BaseModel):
    incident_id: Optional[str] = None
    level: str = "INFO"
    channel: str = "dashboard"
    message: str


class AlertResponse(BaseModel):
    id: str
    incident_id: Optional[str] = None
    level: str
    channel: str
    message: str
    acknowledged: bool
    sent_at: datetime

    model_config = {"from_attributes": True}


# Dashboard KPIs
class DashboardKPIs(BaseModel):
    active_incidents: int
    critical_incidents: int
    high_incidents: int
    unverified_claims: int
    verified_claims: int
    crowd_risk_zones: int
    available_police: int
    available_medical: int
    available_fire: int
    major_snan_mode: bool


# Health
class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: datetime


class AIHealthResponse(BaseModel):
    status: str
    modules: Dict[str, str]


# Simulation
class SimulationStatus(BaseModel):
    running: bool
    current_step: int
    total_steps: int
    major_snan_mode: bool
    message: str
