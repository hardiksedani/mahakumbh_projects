from typing import Any, Dict, List, Optional

import numpy as np

from app.ai.providers.base import EmbeddingProvider


class SentenceTransformerProvider(EmbeddingProvider):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    @property
    def model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception:
                self._model = "mock"
        return self._model

    def embed(self, texts: List[str]) -> List[List[float]]:
        if self.model == "mock":
            return [self._mock_embed(t) for t in texts]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return [e.tolist() for e in embeddings]

    def similarity(self, a: List[float], b: List[float]) -> float:
        va, vb = np.array(a), np.array(b)
        denom = np.linalg.norm(va) * np.linalg.norm(vb)
        if denom == 0:
            return 0.0
        return float(np.dot(va, vb) / denom)

    def _mock_embed(self, text: str) -> List[float]:
        rng = np.random.default_rng(abs(hash(text)) % (2**32))
        vec = rng.random(384)
        return (vec / np.linalg.norm(vec)).tolist()
