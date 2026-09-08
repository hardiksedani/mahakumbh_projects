import uuid

from datetime import datetime, timezone

from typing import Any, Dict, Optional



from app.ai.providers.factory import get_llm_provider

from app.ai.verification.engine import VerificationEngine, IncidentClusteringEngine

from app.db.document_models import make_social_post, make_verification_result

from app.db.firestore import FirestoreDB

from app.services.social_adapters import MockInstagramAdapter





class SocialService:

    def __init__(self):

        self.llm = get_llm_provider()

        self.verifier = VerificationEngine()

        self.clusterer = IncidentClusteringEngine()

        self.adapter = MockInstagramAdapter()



    async def ingest_and_analyze(self, db: FirestoreDB, data: Dict[str, Any]) -> dict:

        text = " ".join(filter(None, [data.get("caption"), data.get("transcript")]))

        extracted = self.llm.extract_claim(text)

        location = extracted.get("location", {})



        post = make_social_post(

            platform=data.get("platform", "instagram"),

            post_url=data.get("post_url"),

            caption=data.get("caption"),

            transcript=data.get("transcript"),

            extracted_claim=extracted,

            urgency_score=extracted.get("urgency", 0),

            relevance_score=extracted.get("relevance", 0),

            social_priority_score=extracted.get("urgency", 0) * 0.5 + extracted.get("relevance", 0) * 0.5,

            location_name=location.get("location_name"),

            location_confidence=location.get("confidence", 0),

            engagement=data.get("engagement", {}),

            posted_at=data.get("posted_at") or datetime.now(timezone.utc).isoformat(),

        )

        await db.create("social_posts", post)

        return post



    async def verify_url(self, db: FirestoreDB, request: Dict[str, Any]) -> Dict[str, Any]:

        caption = request.get("caption") or ""

        if request.get("url") and not caption:

            posts = await self.adapter.fetch_posts(1)

            if posts:

                caption = posts[0].get("caption", "")



        extracted = self.llm.extract_claim(caption or request.get("transcript", ""))

        location = extracted.get("location", {})

        lat, lng = self._geocode(location.get("location_name"))



        verification = await self.verifier.verify_claim(

            db,

            claim=extracted.get("claim", caption),

            incident_type=extracted.get("incident_type"),

            latitude=lat,

            longitude=lng,

        )



        return {

            "claim": extracted.get("claim", caption),

            "likely_location": location.get("location_name"),

            "likely_event": extracted.get("incident_type"),

            "verification_status": verification["status"],

            "confidence": verification["confidence"],

            "ground_evidence": verification["evidence"],

            "reasoning": (

                f"Found {verification['reasoning']['camera_events_found']} nearby camera events. "

                f"Status: {verification['status']}"

                if verification["reasoning"].get("camera_events_found")

                else f"Status: {verification['status']}"

            ),

        }



    def _geocode(self, location_name: Optional[str]):

        locations = {

            "Gate 7": (19.9975, 73.7898),

            "Gate 3": (19.9850, 73.7750),

            "Ramkund": (19.9970, 73.7900),

            "Godavari Ghat": (19.9960, 73.7910),

            "Panchvati": (20.0080, 73.7920),

            "Trimbakeshwar": (19.9320, 73.5310),

            "Tapovan": (20.0150, 73.7950),

        }

        if location_name:

            for name, coords in locations.items():

                if name.lower() in location_name.lower():

                    return coords

        return None, None

