"""Source adapter architecture for KumbhRakshak Social Intelligence.
Enforces compliance: No unauthorized private account scraping.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid


class SocialSourceAdapter(ABC):
    """Abstract interface for all social and public ingestion sources."""

    @abstractmethod
    def source_name(self) -> str:
        pass

    @abstractmethod
    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def normalize_post(self, raw_post: Dict[str, Any]) -> Dict[str, Any]:
        pass


class MockInstagramAdapter(SocialSourceAdapter):
    """Deterministic simulated social stream for DEMO_MODE."""

    MOCK_ITEMS = [
        {
            "id": "post-mock-001",
            "platform": "instagram",
            "post_url": "https://instagram.com/reel/DEMO_GATE7_CROWD",
            "creator_handle": "nashik_travel_guide",
            "creator_category": "LOCAL_CREATOR",
            "caption": "Devotees stuck near Ram Kund Gate 7, massive compression at entry! Moving very slowly!",
            "location_name": "Gate 7",
            "urgency": 0.82,
            "relevance": 0.94,
            "likes": 14200,
            "shares": 3840,
            "is_recycled": False,
        },
        {
            "id": "post-mock-002",
            "platform": "x_twitter",
            "post_url": "https://x.com/prayag_yatri/status/DEMO_10293",
            "creator_handle": "kumbh_devotee_99",
            "creator_category": "DEVOTEE",
            "caption": "URGENT: 50-60 people dead in sudden stampede at Gate 7 near Ram Kund! Run away!",
            "location_name": "Gate 7",
            "urgency": 0.95,
            "relevance": 0.98,
            "likes": 28400,
            "shares": 8900,
            "is_recycled": False,
        },
        {
            "id": "post-mock-003",
            "platform": "whatsapp_bulletin",
            "post_url": "https://whatsapp.com/channel/DEMO_NASHIK_UPDATE",
            "creator_handle": "forwarded_many_times",
            "creator_category": "GENERAL",
            "caption": "Trimbakeshwar Temple is completely CLOSED for all general public today due to VIP movement.",
            "location_name": "Trimbakeshwar",
            "urgency": 0.76,
            "relevance": 0.88,
            "likes": 5000,
            "shares": 12000,
            "is_recycled": True,  # Old recycled message
        },
        {
            "id": "post-mock-004",
            "platform": "instagram",
            "post_url": "https://instagram.com/p/DEMO_CAMPFIRE_SMOKE",
            "creator_handle": "sadhu_gram_diaries",
            "creator_category": "DEVOTEE",
            "caption": "Huge smoke clouds rising from Sector 4 tent pandal! People rushing towards road!",
            "location_name": "Sector 4",
            "urgency": 0.85,
            "relevance": 0.91,
            "likes": 8300,
            "shares": 2400,
            "is_recycled": False,
        },
        {
            "id": "post-mock-005",
            "platform": "official_feed",
            "post_url": "https://x.com/NashikPolice/status/OFFICIAL_001",
            "creator_handle": "nashik_police_official",
            "creator_category": "OFFICIAL",
            "caption": "ADVISORY: Ram Kund Gate 7 has normal regulated entry. Gate 3 is open for smooth exit. Do not heed rumors.",
            "location_name": "Ram Kund",
            "urgency": 0.50,
            "relevance": 0.99,
            "likes": 42000,
            "shares": 15000,
            "is_recycled": False,
        },
    ]

    def source_name(self) -> str:
        return "Simulated Social Feed (DEMO_MODE)"

    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [self.normalize_post(p) for p in self.MOCK_ITEMS[:limit]]

    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        for p in self.MOCK_ITEMS:
            if p["id"] == post_id:
                return self.normalize_post(p)
        return None

    def normalize_post(self, raw_post: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": raw_post.get("id", str(uuid.uuid4())),
            "platform": raw_post.get("platform", "instagram"),
            "post_url": raw_post.get("post_url", ""),
            "creator_handle": raw_post.get("creator_handle", "anonymous"),
            "creator_category": raw_post.get("creator_category", "GENERAL"),
            "caption": raw_post.get("caption", ""),
            "location_name": raw_post.get("location_name", "Nashik Mela Ground"),
            "urgency_score": raw_post.get("urgency", 0.5),
            "relevance_score": raw_post.get("relevance", 0.5),
            "engagement": {
                "likes": raw_post.get("likes", 0),
                "shares": raw_post.get("shares", 0),
            },
            "is_recycled": raw_post.get("is_recycled", False),
            "source_provenance": "DEMO / SIMULATED DATA",
            "posted_at": datetime.now(timezone.utc).isoformat(),
        }


class OfficialSourceAdapter(SocialSourceAdapter):
    """Adapter for official verified government and police accounts."""

    def source_name(self) -> str:
        return "Official Authority Channels"

    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        return None

    def normalize_post(self, raw_post: Dict[str, Any]) -> Dict[str, Any]:
        raw_post["source_provenance"] = "OFFICIAL GOVERNMENT SOURCE"
        return raw_post


class UserSubmissionAdapter(SocialSourceAdapter):
    """Adapter for voluntary citizen-submitted reels, photos and reports."""

    def source_name(self) -> str:
        return "Citizen Report / Verification Portal"

    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        return None

    def normalize_post(self, raw_post: Dict[str, Any]) -> Dict[str, Any]:
        raw_post["source_provenance"] = "USER_SUBMITTED_CONTENT"
        return raw_post


class InstagramAdapter(SocialSourceAdapter):
    """Authorized Meta Graph API placeholder for production integration."""

    def source_name(self) -> str:
        return "Instagram Authorized Graph API"

    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        # In demo without live token, returns empty and instructs user
        return []

    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        return None

    def normalize_post(self, raw_post: Dict[str, Any]) -> Dict[str, Any]:
        return raw_post
