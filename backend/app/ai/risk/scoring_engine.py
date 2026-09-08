from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.config import get_model_config, settings


class RiskScoringEngine:
    """Deterministic explainable risk scoring engine."""

    def __init__(self):
        config = get_model_config().get("risk", {})
        self.weights = config.get("weights", {})
        self.thresholds = config.get("thresholds", {"green": 24, "yellow": 49, "orange": 74})

    def compute(
        self,
        event_severity: str = "INFO",
        confidence: float = 0.0,
        crowd_density: float = 0.0,
        growth_rate: float = 0.0,
        report_count: int = 0,
        source_diversity: int = 0,
        camera_confirmation: float = 0.0,
        location_risk: float = 0.5,
        snan_mode: bool = False,
        shelter_pressure: float = 0.0,
    ) -> Dict[str, Any]:
        severity_map = {"INFO": 0.2, "WARNING": 0.5, "HIGH": 0.75, "CRITICAL": 1.0}
        severity_score = severity_map.get(event_severity, 0.2)

        factors = {
            "event_severity": severity_score,
            "confidence": confidence,
            "crowd_density": crowd_density,
            "growth_rate": min(1.0, growth_rate / 100),
            "report_count": min(1.0, report_count / 10),
            "source_diversity": min(1.0, source_diversity / 5),
            "camera_confirmation": camera_confirmation,
            "location_risk": location_risk,
            "snan_mode": 1.0 if snan_mode else 0.0,
            "shelter_pressure": shelter_pressure,
        }

        w = self.weights
        raw = sum(factors.get(k, 0) * w.get(k, 0.1) for k in factors)
        score = min(100, raw * 100)
        if snan_mode or settings.major_snan_mode:
            score = min(100, score + get_model_config().get("snan_mode", {}).get("alert_priority_boost", 20) * 0.3)

        level = self._level(score)
        return {
            "risk_score": round(score, 1),
            "risk_level": level,
            "factors": {k: round(v, 3) for k, v in factors.items()},
            "explanation": self._explain(factors, score, level),
        }

    def compute_priority(
        self,
        potential_harm: float,
        population_exposure: float,
        uncertainty_factor: float,
        event_severity: float,
    ) -> Dict[str, Any]:
        priority = potential_harm * population_exposure * uncertainty_factor * event_severity
        return {
            "priority_score": round(min(100, priority * 100), 1),
            "reasons": [
                f"Potential harm factor: {potential_harm:.2f}",
                f"Population exposure: {population_exposure:.2f}",
                f"Uncertainty requires verification: {uncertainty_factor:.2f}",
            ],
        }

    def _level(self, score: float) -> str:
        if score <= self.thresholds.get("green", 24):
            return "GREEN"
        if score <= self.thresholds.get("yellow", 49):
            return "YELLOW"
        if score <= self.thresholds.get("orange", 74):
            return "ORANGE"
        return "RED"

    def _explain(self, factors: Dict[str, float], score: float, level: str) -> str:
        top = sorted(factors.items(), key=lambda x: x[1], reverse=True)[:3]
        parts = [f"{k}={v:.2f}" for k, v in top]
        return f"Risk {level} ({score:.0f}/100). Top factors: {', '.join(parts)}."
