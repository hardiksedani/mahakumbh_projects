import random
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import numpy as np


class CrowdForecastEngine:
    """XGBoost/statistical crowd forecasting with simulated historical data."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self._model = None
        self._history = self._generate_historical()

    def _generate_historical(self) -> List[Dict]:
        base = datetime.now(timezone.utc) - timedelta(days=7)
        records = []
        for i in range(168):
            t = base + timedelta(hours=i)
            hour = t.hour
            base_pop = 5000 + 3000 * np.sin(hour / 24 * 2 * np.pi)
            records.append({
                "hour": hour,
                "day_of_week": t.weekday(),
                "population": int(base_pop + self.rng.integers(-500, 500)),
                "inflow": float(self.rng.integers(100, 800)),
                "outflow": float(self.rng.integers(80, 700)),
            })
        return records

    def forecast(
        self,
        zone_id: str,
        current_population: int,
        inflow: float = 0,
        outflow: float = 0,
        capacity: int = 50000,
        horizons: Optional[List[int]] = None,
    ) -> List[Dict[str, Any]]:
        horizons = horizons or [15, 30, 60]
        now = datetime.now(timezone.utc)
        net_flow = inflow - outflow
        results = []
        for h in horizons:
            growth_factor = 1 + (net_flow / max(current_population, 1)) * (h / 15)
            noise = self.rng.normal(0, 0.05)
            predicted = int(current_population * growth_factor * (1 + noise))
            density = min(1.0, predicted / capacity)
            overflow = max(0, (predicted - capacity * 0.9) / (capacity * 0.1)) if capacity else 0
            results.append({
                "zone_id": zone_id,
                "horizon_minutes": h,
                "predicted_population": predicted,
                "predicted_density": round(density, 3),
                "overflow_risk": round(min(1.0, overflow), 3),
                "predicted_for": now + timedelta(minutes=h),
                "model_metadata": {"provider": "statistical", "seed": self.seed},
            })
        return results
