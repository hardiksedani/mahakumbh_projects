import json
import re
from typing import Any, Dict, List

from app.ai.providers.base import LLMProvider


INCIDENT_KEYWORDS = {
    "FIRE": ["fire", "smoke", "aag", "dhua", "jal", "flames"],
    "CROWD": ["crowd", "stampede", "rush", "bheed", "jam", "stuck", "gate"],
    "MEDICAL": ["medical", "ambulance", "collapse", "fainted", "person down", "injured"],
    "ACCIDENT": ["accident", "collision", "crash", "vehicle", "bike"],
    "SECURITY": ["fight", "theft", "suspicious", "security"],
    "INFRASTRUCTURE": ["block", "flooding", "water", "barricade", "damage"],
}


class MockLLMProvider(LLMProvider):
    """Deterministic mock LLM for hackathon demo without API keys."""

    def classify_incident(self, text: str) -> Dict[str, Any]:
        text_lower = (text or "").lower()
        best_type = "OTHER"
        best_score = 0.0
        for incident_type, keywords in INCIDENT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower) / max(len(keywords), 1)
            if score > best_score:
                best_score = score
                best_type = incident_type
        urgency = min(1.0, 0.3 + best_score * 0.7)
        if any(w in text_lower for w in ["urgent", "help", "emergency", "critical"]):
            urgency = min(1.0, urgency + 0.2)
        return {
            "incident_type": best_type if best_score > 0 else "OTHER",
            "urgency": round(urgency, 2),
            "relevance": round(min(1.0, 0.4 + best_score), 2),
            "confidence": round(min(0.95, 0.5 + best_score * 0.4), 2),
            "provider": "mock",
        }

    def extract_claim(self, text: str) -> Dict[str, Any]:
        classification = self.classify_incident(text)
        location = self._extract_location(text)
        return {
            "claim": (text or "")[:500],
            "incident_type": classification["incident_type"],
            "location": location,
            "urgency": classification["urgency"],
            "relevance": classification["relevance"],
            "confidence": classification["confidence"],
            "entities": self._extract_entities(text),
        }

    def generate_recommendation(self, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        incident = structured_data.get("incident", {})
        incident_type = incident.get("incident_type", "OTHER")
        severity = incident.get("severity", "INFO")
        location = incident.get("location_name", "affected area")
        nearest = structured_data.get("nearest_units", [])
        cameras = structured_data.get("nearby_cameras", [])

        actions = []
        if incident_type == "FIRE":
            actions = [
                f"Verify fire using {cameras[0]['camera_code'] if cameras else 'nearest camera'}",
                "Dispatch nearest fire unit",
                "Deploy police for crowd control",
                "Prevent entry into affected zone",
            ]
        elif incident_type == "CROWD":
            actions = [
                "Increase monitoring on major routes",
                "Deploy crowd management volunteers",
                "Redirect inflow at nearest gates",
                "Issue public advisory via official channels",
            ]
        elif incident_type == "MEDICAL":
            actions = [
                "Dispatch nearest medical unit",
                "Clear access route for ambulance",
                "Verify person-down event on camera",
            ]
        else:
            actions = [
                "Assign analyst for verification",
                "Monitor nearby cameras",
                "Prepare standby response units",
            ]

        return {
            "incident_id": str(incident.get("id", "")),
            "priority": "CRITICAL" if severity in ("CRITICAL", "HIGH") else "HIGH",
            "recommended_actions": actions[:4],
            "reasoning_summary": (
                f"Based on structured evidence: {incident_type} event at {location} "
                f"with severity {severity}. {len(nearest)} response units identified nearby."
            ),
            "confidence": incident.get("confidence", 0.7),
            "provider": "mock",
            "input_evidence": structured_data,
        }

    def _extract_location(self, text: str) -> Dict[str, Any]:
        text = text or ""
        gate_match = re.search(r"gate\s*(\d+)", text, re.I)
        if gate_match:
            return {"location_name": f"Gate {gate_match.group(1)}", "confidence": 0.85}
        for name in ["Ramkund", "Godavari Ghat", "Trimbakeshwar", "Panchvati", "Tapovan"]:
            if name.lower() in text.lower():
                return {"location_name": name, "confidence": 0.8}
        return {"location_name": None, "confidence": 0.0}

    def _extract_entities(self, text: str) -> List[str]:
        entities = []
        for name in ["Gate 7", "Gate 3", "Ramkund", "fire", "crowd", "ambulance"]:
            if name.lower() in (text or "").lower():
                entities.append(name)
        return entities


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model
        self._mock = MockLLMProvider()

    def classify_incident(self, text: str) -> Dict[str, Any]:
        if not self.api_key:
            return self._mock.classify_incident(text)
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            resp = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Classify Kumbh Mela incident reports. Return JSON with incident_type, urgency, relevance, confidence."},
                    {"role": "user", "content": text},
                ],
                response_format={"type": "json_object"},
            )
            return json.loads(resp.choices[0].message.content)
        except Exception:
            return self._mock.classify_incident(text)

    def extract_claim(self, text: str) -> Dict[str, Any]:
        if not self.api_key:
            return self._mock.extract_claim(text)
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            resp = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Extract incident claim from social post. Return JSON with claim, incident_type, location, urgency, relevance, confidence, entities."},
                    {"role": "user", "content": text},
                ],
                response_format={"type": "json_object"},
            )
            return json.loads(resp.choices[0].message.content)
        except Exception:
            return self._mock.extract_claim(text)

    def generate_recommendation(self, structured_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            return self._mock.generate_recommendation(structured_data)
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            resp = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Generate decision support recommendation ONLY from provided structured facts. Do not invent evidence. Return JSON with incident_id, priority, recommended_actions, reasoning_summary, confidence."},
                    {"role": "user", "content": json.dumps(structured_data)},
                ],
                response_format={"type": "json_object"},
            )
            result = json.loads(resp.choices[0].message.content)
            result["input_evidence"] = structured_data
            result["provider"] = "openai"
            return result
        except Exception:
            return self._mock.generate_recommendation(structured_data)
