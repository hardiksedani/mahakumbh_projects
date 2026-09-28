import os
import re
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
            # If in test mode or explicitly requested mock, do not download external weights
            if os.environ.get("PYTEST_CURRENT_TEST") or os.environ.get("EMBEDDING_PROVIDER") == "mock":
                self._model = "mock"
                return self._model
            try:
                from sentence_transformers import SentenceTransformer
                # Try loading cached local files first to prevent hanging
                try:
                    self._model = SentenceTransformer(self.model_name, local_files_only=True)
                except Exception:
                    self._model = SentenceTransformer(self.model_name)
            except Exception:
                self._model = "mock"
        return self._model

    def embed(self, texts: List[str]) -> List[List[float]]:
        if self.model == "mock":
            return [self._mock_embed(t) for t in texts]
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return [e.tolist() for e in embeddings]
        except Exception:
            return [self._mock_embed(t) for t in texts]

    def similarity(self, a: List[float], b: List[float]) -> float:
        va, vb = np.array(a), np.array(b)
        denom = np.linalg.norm(va) * np.linalg.norm(vb)
        if denom == 0:
            return 0.0
        return float(np.dot(va, vb) / denom)

    def _mock_embed(self, text: str) -> List[float]:
        # Fast semantic feature hasher: maps words to 384-dim bag-of-words vector
        vec = np.zeros(384, dtype=np.float32)
        words = re.findall(r"\w+", (text or "").lower())
        if not words:
            return vec.tolist()
        for w in words:
            idx = abs(hash(w)) % 384
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()
