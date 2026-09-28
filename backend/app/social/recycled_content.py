"""Recycled and Outdated Media Detection Engine.
Detects recycled historical videos or out-of-context clips circulated during high-alert moments.
Uses non-accusatory language: flags as 'POSSIBLE_REUSED_CONTENT' with factual archive comparison.
"""

from typing import Any, Dict, List, Optional
import hashlib


class RecycledContentDetector:
    """Compares incoming media metadata, textual embeddings, and hash fingerprints against historical archives."""

    # Known historical clips archive (e.g., Haridwar 2021, Prayagraj 2019, or old fires)
    ARCHIVED_FINGERPRINTS = [
        {
            "archive_id": "ARCH-2019-PRAYAG-01",
            "title": "2019 Digambari Akhada Tent Fire Incident",
            "historical_date": "January 2019",
            "keywords": ["tent fire", "smoke", "sector 16", "cylinder blast", "akhada fire"],
            "hash_prefix": "e8f1a2",
            "context_note": "Archive video of 2019 Prayagraj cylinder fire; legally resolved without casualties.",
        },
        {
            "archive_id": "ARCH-2021-HARIDWAR-04",
            "title": "2021 Haridwar Bridge Congestion Clip",
            "historical_date": "April 2021",
            "keywords": ["bridge jam", "har ki pauri", "stampede like", "railway bridge"],
            "hash_prefix": "9b3c4d",
            "context_note": "Archive footage from 2021 Haridwar bridge diversion.",
        },
    ]

    def analyze(self, text: str, media_hash: Optional[str] = None) -> Dict[str, Any]:
        """Evaluates whether content shows indicators of being recycled historical media."""
        text_lower = (text or "").lower()
        matched_archive = None

        # 1. Check hash prefix if provided
        if media_hash:
            for arch in self.ARCHIVED_FINGERPRINTS:
                if arch["hash_prefix"] in media_hash.lower():
                    matched_archive = arch
                    break

        # 2. Check semantic keywords if no exact media hash match
        if not matched_archive:
            for arch in self.ARCHIVED_FINGERPRINTS:
                kw_matches = sum(1 for kw in arch["keywords"] if kw in text_lower)
                if kw_matches >= 2:
                    matched_archive = arch
                    break

        if matched_archive:
            return {
                "is_recycled": True,
                "classification": "POSSIBLE_REUSED_CONTENT",
                "confidence": 0.86,
                "advisory_message": (
                    "Available evidence indicates this visual media may correspond to a historical event "
                    f"({matched_archive['title']}, {matched_archive['historical_date']}) and not current conditions."
                ),
                "matched_archive": matched_archive,
            }

        return {
            "is_recycled": False,
            "classification": "CURRENT_EVENT_PROBABLE",
            "confidence": 0.92,
            "advisory_message": "No historical match found in Kumbh archive index.",
            "matched_archive": None,
        }
