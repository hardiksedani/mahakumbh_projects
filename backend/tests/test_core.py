import pytest
from app.ai.risk.scoring_engine import RiskScoringEngine
from app.ai.providers.llm_provider import MockLLMProvider
from app.ai.verification.engine import IncidentClusteringEngine


def test_fire_event_critical_risk():
    engine = RiskScoringEngine()
    result = engine.compute(event_severity="CRITICAL", confidence=0.94, camera_confirmation=0.9)
    assert result["risk_score"] > 50
    assert result["risk_level"] in ("ORANGE", "RED")


def test_social_clustering_same_location():
    clusterer = IncidentClusteringEngine()
    posts = [
        {"caption": "Massive crowd at Gate 7", "latitude": 19.997, "longitude": 73.79, "cluster_id": "cluster-1"},
        {"caption": "People stuck at Gate 7", "latitude": 19.997, "longitude": 73.79},
    ]
    cluster = clusterer.find_cluster("Gate 7 is impossible to cross", "CROWD", posts, 19.997, 73.79)
    assert cluster == "cluster-1"


def test_social_claim_classification():
    llm = MockLLMProvider()
    result = llm.classify_incident("Fire near Gate 7, smoke everywhere!")
    assert result["incident_type"] == "FIRE"
    assert result["urgency"] > 0.5


def test_unverified_low_camera_support():
    engine = RiskScoringEngine()
    result = engine.compute(event_severity="WARNING", confidence=0.4, camera_confirmation=0.0, report_count=1)
    assert result["risk_level"] in ("GREEN", "YELLOW", "ORANGE")


def test_shelter_overflow_risk():
    occupancy = 950
    capacity = 1000
    pressure = occupancy / capacity
    assert pressure > 0.9


def test_nearest_unit_distance():
    from app.services.core_services import haversine_km
    d = haversine_km(19.997, 73.79, 19.998, 73.791)
    assert d < 1.0
