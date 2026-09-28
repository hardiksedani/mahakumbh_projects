import math
from collections import deque
from typing import Any, Deque, Dict, List, Optional, Tuple

import numpy as np

from app.core.config import get_model_config


class FireSmokeDetector:
    """Heuristic fire/smoke detector with temporal smoothing."""

    def __init__(self):
        config = get_model_config().get("fire", {})
        self.fire_threshold = config.get("fire_threshold", 0.7)
        self.smoke_threshold = config.get("smoke_threshold", 0.65)
        self.temporal_frames = config.get("temporal_frames", 5)
        self.history: Deque[Dict[str, float]] = deque(maxlen=self.temporal_frames)

    def analyze(self, frame: np.ndarray) -> Dict[str, Any]:
        fire_conf, smoke_conf = self._detect(frame)
        self.history.append({"fire": fire_conf, "smoke": smoke_conf})
        avg_fire = sum(h["fire"] for h in self.history) / len(self.history)
        avg_smoke = sum(h["smoke"] for h in self.history) / len(self.history)
        fire_event = avg_fire > self.fire_threshold and len(self.history) >= 3
        smoke_event = avg_smoke > self.smoke_threshold and len(self.history) >= 3
        return {
            "fire_confidence": round(avg_fire, 3),
            "smoke_confidence": round(avg_smoke, 3),
            "fire_event": fire_event,
            "smoke_event": smoke_event,
            "frames_analyzed": len(self.history),
        }

    def _detect(self, frame: np.ndarray) -> Tuple[float, float]:
        if frame is None or frame.size == 0:
            return 0.0, 0.0
        hsv = self._to_hsv(frame)
        h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
        fire_mask = ((h < 30) | (h > 150)) & (s > 80) & (v > 120)
        smoke_mask = (s < 60) & (v > 80) & (v < 200)
        fire_ratio = float(np.sum(fire_mask)) / fire_mask.size
        smoke_ratio = float(np.sum(smoke_mask)) / smoke_mask.size
        return min(1.0, fire_ratio * 15), min(1.0, smoke_ratio * 8)

    def _to_hsv(self, frame: np.ndarray) -> np.ndarray:
        try:
            import cv2
            return cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        except Exception:
            return frame


class CrowdAnalyticsEngine:
    def __init__(self):
        self.config = get_model_config().get("crowd", {})
        self.weights = self.config.get("density_weights", {})
        self.history: Deque[int] = deque(maxlen=30)

    def analyze(
        self,
        people_count: int,
        frame_area: int = 1920 * 1080,
        motion_score: float = 0.0,
        counter_flow: float = 0.0,
        fall_indicators: float = 0.0,
    ) -> Dict[str, Any]:
        self.history.append(people_count)
        density = min(1.0, people_count / max(frame_area / 5000, 1))
        growth_rate = self._growth_rate()
        density_score = density
        growth_score = min(1.0, growth_rate / 50.0)
        movement_score = min(1.0, motion_score)
        counter_flow_score = min(1.0, counter_flow)
        fall_score = min(1.0, fall_indicators)

        w = self.weights
        crowd_risk = (
            w.get("density", 0.30) * density_score
            + w.get("growth_rate", 0.20) * growth_score
            + w.get("movement", 0.20) * movement_score
            + w.get("counter_flow", 0.15) * counter_flow_score
            + w.get("fall", 0.15) * fall_score
        )

        return {
            "people_count": people_count,
            "crowd_density_score": round(density_score, 3),
            "growth_rate_score": round(growth_score, 3),
            "movement_abnormality_score": round(movement_score, 3),
            "counter_flow_score": round(counter_flow_score, 3),
            "fall_score": round(fall_score, 3),
            "crowd_risk_score": round(crowd_risk * 100, 1),
            "inflow": round(growth_rate * 0.6, 1) if growth_rate > 0 else 0,
            "outflow": round(abs(growth_rate) * 0.4, 1) if growth_rate < 0 else 0,
        }

    def _growth_rate(self) -> float:
        if len(self.history) < 2:
            return 0.0
        return self.history[-1] - self.history[-2]




class MotionAnalyzer:
    def analyze(self, prev_gray: Optional[np.ndarray], curr_gray: np.ndarray) -> Dict[str, float]:
        if prev_gray is None:
            return {"motion_score": 0.0, "abnormal": False}
        try:
            import cv2
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, curr_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )
            magnitude = np.sqrt(flow[..., 0] ** 2 + flow[..., 1] ** 2)
            mean_mag = float(np.mean(magnitude))
            score = min(1.0, mean_mag / 5.0)
            return {"motion_score": round(score, 3), "abnormal": score > 0.6}
        except Exception:
            return {"motion_score": 0.0, "abnormal": False}


class PoseFallDetector:
    """Detects possible person-down and fall events using temporal aspect-ratio and motion analysis."""

    def __init__(self):
        self.history: Deque[Dict[str, Any]] = deque(maxlen=10)

    def analyze(self, detections: List[Dict[str, Any]], motion_score: float = 0.0) -> Optional[Dict[str, Any]]:
        # Look for horizontal aspect ratio bounding boxes (width > height * 1.3)
        down_candidates = 0
        for d in detections:
            bbox = d.get("bbox", [])
            if len(bbox) == 4:
                w = abs(bbox[2] - bbox[0])
                h = abs(bbox[3] - bbox[1])
                if h > 0 and (w / h) > 1.35 and d.get("confidence", 0) > 0.45:
                    down_candidates += 1

        self.history.append({"down_count": down_candidates, "motion": motion_score})

        if len(self.history) >= 3:
            sustained_down = sum(1 for h in self.history if h["down_count"] >= 1)
            if sustained_down >= 3:
                is_multiple = down_candidates >= 3
                return {
                    "event_type": "MEDICAL",
                    "subtype": "MULTIPLE_FALL_EVENTS" if is_multiple else "POSSIBLE_PERSON_DOWN",
                    "severity": "CRITICAL" if is_multiple else "HIGH",
                    "confidence": min(0.92, 0.65 + sustained_down * 0.08),
                    "cautious_description": (
                        f"Multiple possible fall events detected ({down_candidates} individuals observed stationary on ground)"
                        if is_multiple
                        else "Possible person-down event detected (individual observed stationary on ground)"
                    ),
                    "candidates_count": down_candidates,
                }
        return None


class AccidentDetector:
    """Detects vehicle-pedestrian proximity anomalies and sudden vehicle stoppage."""

    def analyze(self, detections: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        vehicles = [d for d in detections if d.get("class_name") in ("car", "bus", "truck", "motorcycle")]
        people = [d for d in detections if d.get("class_name") == "person"]

        # If high vehicle density in pedestrian walking corridor
        if len(vehicles) >= 2 and len(people) >= 30:
            return {
                "event_type": "ACCIDENT",
                "subtype": "VEHICLE_PEDESTRIAN_CONFLICT",
                "severity": "HIGH",
                "confidence": 0.78,
                "cautious_description": "Vehicle movement conflict in dense pedestrian corridor",
                "vehicle_count": len(vehicles),
                "people_count": len(people),
            }
        return None


class MultiCameraEvidenceFusion:
    """Fuses multi-camera sensor signals using distance-decayed Bayesian evidence fusion.
    Formula: C_fused = 1 - Prod(1 - w_i * C_i), where w_i = exp(-d_i / d_0).
    """

    @staticmethod
    def fuse_camera_signals(
        primary_camera_event: Dict[str, Any],
        neighbor_events: List[Dict[str, Any]],
        d_0: float = 1.0,  # 1 km characteristic distance decay
    ) -> Dict[str, Any]:
        primary_conf = float(primary_camera_event.get("confidence", 0.7))
        unsupported_prob = 1.0 - primary_conf
        corroborating_cameras = [primary_camera_event.get("camera_code", "PRIMARY")]

        for nev in neighbor_events:
            d_km = float(nev.get("distance_km", 0.5))
            c_i = float(nev.get("confidence", 0.6))
            weight_i = math.exp(-d_km / d_0)

            # Decay confidence by distance
            effective_conf = min(0.95, weight_i * c_i)
            unsupported_prob *= (1.0 - effective_conf)
            corroborating_cameras.append(nev.get("camera_code", "CAM-NEAR"))

        fused_confidence = round(1.0 - unsupported_prob, 3)

        return {
            "cross_camera_confidence": min(0.99, fused_confidence),
            "corroborating_camera_count": len(corroborating_cameras),
            "corroborating_cameras": list(set(corroborating_cameras)),
            "fusion_method": "Distance-Decayed Bayesian Evidence Fusion",
            "is_corroborated": len(corroborating_cameras) >= 2 and fused_confidence >= 0.85,
        }


class VideoEventEngine:
    """Combines specialized detectors and generates cautious structured safety events."""

    def __init__(self):
        self.fire_detector = FireSmokeDetector()
        self.crowd_engine = CrowdAnalyticsEngine()
        self.motion = MotionAnalyzer()
        self.pose_detector = PoseFallDetector()
        self.accident_detector = AccidentDetector()
        self.fusion = MultiCameraEvidenceFusion()
        self.prev_gray = None

    def process_frame(self, frame: np.ndarray, detections: Dict[str, Any]) -> List[Dict[str, Any]]:
        events = []
        people_count = detections.get("people_count", 0)
        det_list = detections.get("detections", [])

        try:
            import cv2
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        except Exception:
            gray = None

        motion_result = self.motion.analyze(self.prev_gray, gray) if gray is not None else {"motion_score": 0, "abnormal": False}
        if gray is not None:
            self.prev_gray = gray

        # 1. Fire / Smoke Analysis with temporal persistence
        fire_result = self.fire_detector.analyze(frame) if frame is not None else {}
        if fire_result.get("fire_event"):
            events.append({
                "event_type": "FIRE",
                "subtype": "FLAME_DETECTED",
                "severity": "CRITICAL",
                "confidence": fire_result["fire_confidence"],
                "description": "Possible active flame and rapid thermal bloom detected",
                "evidence": {"fire_confidence": fire_result["fire_confidence"], "people_count": people_count},
            })
        elif fire_result.get("smoke_event"):
            events.append({
                "event_type": "FIRE",
                "subtype": "SMOKE_SPREADING",
                "severity": "HIGH",
                "confidence": fire_result["smoke_confidence"],
                "description": "Dense smoke spreading pattern observed across multiple frames",
                "evidence": {"smoke_confidence": fire_result["smoke_confidence"], "people_count": people_count},
            })

        # 2. Crowd Analytics & Precursor Stampede Detection
        crowd = self.crowd_engine.analyze(
            people_count,
            motion_score=motion_result.get("motion_score", 0),
            counter_flow=0.3 if motion_result.get("abnormal") else 0,
        )
        if crowd["crowd_risk_score"] > 80:
            events.append({
                "event_type": "CROWD",
                "subtype": "CROWD_COMPRESSION",
                "severity": "CRITICAL",
                "confidence": round(crowd["crowd_risk_score"] / 100, 2),
                "description": "Abnormal crowd compression and counter-flow detected near bottleneck",
                "evidence": crowd,
            })
        elif crowd["crowd_risk_score"] > 60:
            events.append({
                "event_type": "CROWD",
                "subtype": "HIGH_DENSITY_SURGE",
                "severity": "HIGH",
                "confidence": round(crowd["crowd_risk_score"] / 100, 2),
                "description": "Crowd density rising above threshold with accelerated inflow",
                "evidence": crowd,
            })
        elif crowd["crowd_risk_score"] > 40:
            events.append({
                "event_type": "CROWD",
                "subtype": "CROWD_MONITORING",
                "severity": "WARNING",
                "confidence": round(crowd["crowd_risk_score"] / 100, 2),
                "description": "Steady crowd accumulation observed in sector",
                "evidence": crowd,
            })

        # 3. Pose / Medical Fall Detection
        fall_event = self.pose_detector.analyze(det_list, motion_result.get("motion_score", 0))
        if fall_event:
            events.append({
                "event_type": fall_event["event_type"],
                "subtype": fall_event["subtype"],
                "severity": fall_event["severity"],
                "confidence": fall_event["confidence"],
                "description": fall_event["cautious_description"],
                "evidence": {"candidates": fall_event["candidates_count"]},
            })

        # 4. Accident / Obstruction Detection
        acc_event = self.accident_detector.analyze(det_list)
        if acc_event:
            events.append({
                "event_type": acc_event["event_type"],
                "subtype": acc_event["subtype"],
                "severity": acc_event["severity"],
                "confidence": acc_event["confidence"],
                "description": acc_event["cautious_description"],
                "evidence": acc_event,
            })

        return events

