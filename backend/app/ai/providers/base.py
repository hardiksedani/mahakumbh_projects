from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class VisionProvider(ABC):
    @abstractmethod
    def detect(self, frame_bytes: bytes) -> Dict[str, Any]:
        pass

    @abstractmethod
    def analyze_frame(self, frame_bytes: bytes, prompt: str) -> Dict[str, Any]:
        pass


class LLMProvider(ABC):
    @abstractmethod
    def classify_incident(self, text: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def extract_claim(self, text: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def generate_recommendation(self, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        pass


class SpeechProvider(ABC):
    @abstractmethod
    def transcribe(self, audio_path: str, languages: Optional[List[str]] = None) -> Dict[str, Any]:
        pass


class OCRProvider(ABC):
    @abstractmethod
    def extract_text(self, image_bytes: bytes) -> Dict[str, Any]:
        pass


class EmbeddingProvider(ABC):
    @abstractmethod
    def embed(self, texts: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    def similarity(self, a: List[float], b: List[float]) -> float:
        pass
