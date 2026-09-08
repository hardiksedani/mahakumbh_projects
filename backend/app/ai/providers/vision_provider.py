import io
from typing import Any, Dict, List, Optional

import numpy as np
from PIL import Image

from app.ai.providers.base import VisionProvider
from app.core.config import get_model_config, settings


class LocalVisionProvider(VisionProvider):
    """YOLO-based local vision provider."""

    def __init__(self):
        self._model = None
        self.config = get_model_config().get("vision", {})

    @property
    def model(self):
        if self._model is None:
            try:
                from ultralytics import YOLO
                self._model = YOLO(settings.yolo_model)
            except Exception:
                self._model = "mock"
        return self._model

    def detect(self, frame_bytes: bytes) -> Dict[str, Any]:
        if self.model == "mock":
            return self._mock_detect()
        try:
            img = Image.open(io.BytesIO(frame_bytes))
            results = self.model(img, verbose=False)
            detections = []
            people_count = 0
            threshold = self.config.get("confidence_threshold", 0.5)
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    if conf < threshold:
                        continue
                    label = r.names.get(cls_id, str(cls_id))
                    xyxy = box.xyxy[0].tolist()
                    if label == "person":
                        people_count += 1
                    detections.append({"label": label, "confidence": conf, "bbox": xyxy})
            return {
                "people_count": people_count,
                "detections": detections,
                "provider": "yolo",
            }
        except Exception:
            return self._mock_detect()

    def analyze_frame(self, frame_bytes: bytes, prompt: str) -> Dict[str, Any]:
        detection = self.detect(frame_bytes)
        return {
            "description": f"Frame analysis: {detection['people_count']} people detected.",
            "people_count": detection["people_count"],
            "smoke_visible": False,
            "fire_visible": False,
            "crowd_panic": detection["people_count"] > 100,
            "provider": "local_vision",
        }

    def _mock_detect(self) -> Dict[str, Any]:
        rng = np.random.default_rng(42)
        count = int(rng.integers(20, 150))
        return {
            "people_count": count,
            "detections": [{"label": "person", "confidence": 0.85, "bbox": [0, 0, 100, 100]}] * min(count, 5),
            "provider": "mock",
        }


class MockVisionLLMProvider(VisionProvider):
    def detect(self, frame_bytes: bytes) -> Dict[str, Any]:
        return LocalVisionProvider().detect(frame_bytes)

    def analyze_frame(self, frame_bytes: bytes, prompt: str) -> Dict[str, Any]:
        return {
            "description": "Multimodal analysis: crowd visible, no fire detected.",
            "smoke_visible": False,
            "fire_visible": False,
            "crowd_panic": False,
            "accident_visible": False,
            "emergency_vehicles": False,
            "landmarks": [],
            "provider": "mock_vlm",
        }
