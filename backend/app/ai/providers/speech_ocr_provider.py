from typing import Any, Dict, List, Optional

from app.ai.providers.base import OCRProvider, SpeechProvider


class EasyOCRProvider(OCRProvider):
    def __init__(self):
        self._reader = None

    @property
    def reader(self):
        if self._reader is None:
            try:
                import easyocr
                self._reader = easyocr.Reader(["en", "hi"], gpu=False, verbose=False)
            except Exception:
                self._reader = "mock"
        return self._reader

    def extract_text(self, image_bytes: bytes) -> Dict[str, Any]:
        if self.reader == "mock":
            return {"text": "", "blocks": [], "provider": "mock"}
        import io
        import numpy as np
        from PIL import Image
        img = np.array(Image.open(io.BytesIO(image_bytes)))
        results = self.reader.readtext(img)
        blocks = [{"text": r[1], "confidence": float(r[2]), "bbox": r[0]} for r in results]
        text = " ".join(b["text"] for b in blocks)
        return {"text": text, "blocks": blocks, "provider": "easyocr"}


class WhisperProvider(SpeechProvider):
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self._model = None

    @property
    def model(self):
        if self._model is None:
            try:
                from faster_whisper import WhisperModel
                self._model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
            except Exception:
                self._model = "mock"
        return self._model

    def transcribe(self, audio_path: str, languages: Optional[List[str]] = None) -> Dict[str, Any]:
        if self.model == "mock":
            return {
                "transcript": "",
                "language": "en",
                "confidence": 0.0,
                "provider": "mock",
            }
        segments, info = self.model.transcribe(audio_path, language=None)
        text = " ".join(s.text for s in segments)
        return {
            "transcript": text.strip(),
            "language": info.language,
            "confidence": 0.85,
            "provider": "whisper",
        }
