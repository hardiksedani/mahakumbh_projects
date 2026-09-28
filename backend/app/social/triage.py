"""Two-Stage Social Triage Pipeline.
Solves the 'Lakhs of Reels' problem by applying cheap metadata & keyword
heuristics in Stage 1, reserving deep ASR/OCR/VLM inference for Stage 2.
"""

from typing import Any, Dict, List, Tuple
from app.ai.providers.factory import get_llm_provider

# High-priority safety keywords for Stage 1 filter
SAFETY_KEYWORDS = {
    "stampede", "bhagdad", "rush", "bheed", "choke", "stuck", "suffocating",
    "fire", "aag", "smoke", "dhua", "flames", "cylinder", "blast",
    "died", "death", "casualty", "injured", "ghayal", "hospital", "ambulance",
    "accident", "collapse", "bridge", "barricade", "broken", "blocked",
    "jam", "traffic", "diversion", "water", "shortage", "lost", "missing"
}

KUMBH_LOCATIONS = {
    "ram kund", "godavari", "trimbakeshwar", "panchvati", "tapovan",
    "kalaram", "kapila sangam", "sector 4", "gate 7", "gate 3", "sadhu gram"
}


class SocialTriagePipeline:
    """Two-Stage Triage processing raw social posts."""

    def __init__(self):
        self.llm = get_llm_provider()

    def stage_1_cheap_filter(self, post: Dict[str, Any]) -> Tuple[bool, float, str]:
        """Stage 1: Fast deterministic heuristic check (<1ms latency).
        Returns (is_relevant, priority_score, reasoning).
        """
        text = (post.get("caption", "") + " " + post.get("transcript", "")).lower()

        # Check safety keywords
        matched_keywords = [kw for kw in SAFETY_KEYWORDS if kw in text]
        matched_locations = [loc for loc in KUMBH_LOCATIONS if loc in text]

        if not matched_keywords and not matched_locations:
            return False, 0.1, "Discarded at Stage 1: No safety or location keywords detected"

        # Calculate cheap initial priority
        kw_score = min(1.0, len(matched_keywords) * 0.3)
        loc_score = 0.4 if matched_locations else 0.1

        # Check engagement velocity boost (virality)
        engagement = post.get("engagement", {})
        shares = engagement.get("shares", 0)
        virality_boost = min(0.3, shares / 10000.0)

        initial_priority = round(min(1.0, kw_score * 0.5 + loc_score * 0.3 + virality_boost), 2)
        return True, initial_priority, f"Passed Stage 1: {len(matched_keywords)} safety keywords, location match"

    async def stage_2_deep_analysis(self, post: Dict[str, Any]) -> Dict[str, Any]:
        """Stage 2: Deep NLP, semantic extraction, and structured classification."""
        text = post.get("caption", "") or post.get("transcript", "")
        extracted_claim = self.llm.extract_claim(text)

        urgency = float(extracted_claim.get("urgency", 0.5))
        relevance = float(extracted_claim.get("relevance", 0.5))
        location = extracted_claim.get("location", {})

        # Compute composite social priority score
        priority_score = round(urgency * 0.45 + relevance * 0.40 + (0.15 if location.get("location_name") else 0.0), 2)

        return {
            "triage_passed": True,
            "stage_2_completed": True,
            "extracted_claim": extracted_claim,
            "urgency_score": urgency,
            "relevance_score": relevance,
            "social_priority_score": priority_score,
            "requires_verification": urgency >= 0.70 or "stampede" in text.lower() or "fire" in text.lower(),
        }
