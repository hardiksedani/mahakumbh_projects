from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import random


class SocialSourceAdapter(ABC):
    @abstractmethod
    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def search_hashtag(self, hashtag: str, limit: int = 20) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def normalize_post(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        pass


class MockInstagramAdapter(SocialSourceAdapter):
    """Fully functional mock Instagram feed for hackathon demo."""

    POSTS = [
        {"handle": "nashik_updates", "caption": "Massive crowd building at Gate 7 near Ramkund! #Kumbh2026", "followers": 45000, "priority": "HIGH"},
        {"handle": "mela_reporter", "caption": "People stuck at Gate 7, movement very slow #KumbhMelа", "followers": 12000, "priority": "MEDIUM"},
        {"handle": "devotee_vlog", "caption": "Gate 7 is impossible to cross right now, please use alternate route", "followers": 8000, "priority": "MEDIUM"},
        {"handle": "trimbakeshwar_live", "caption": "Peaceful darshan at Trimbakeshwar temple this morning", "followers": 25000, "priority": "LOW"},
        {"handle": "panic_poster", "caption": "STAMPEDE at Gate 7!! Run!!! (unverified)", "followers": 500, "priority": "LOW"},
        {"handle": "official_kumbh", "caption": "All routes to Ramkund are operational. Please follow volunteer guidance.", "followers": 500000, "priority": "CRITICAL"},
        {"handle": "fire_rumor", "caption": "Fire near Gate 7!! Smoke everywhere!!", "followers": 2000, "priority": "MEDIUM"},
        {"handle": "recycled_content", "caption": "Breaking: stampede at Kumbh (old video reposted)", "followers": 15000, "priority": "MEDIUM"},
        {"handle": "medical_alert", "caption": "Need ambulance near Panchvati bridge, elderly person collapsed", "followers": 3000, "priority": "HIGH"},
        {"handle": "crowd_watch", "caption": "Crowd density increasing at Godavari Ghat, estimate 80% capacity", "followers": 18000, "priority": "HIGH"},
    ]

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)

    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        posts = self.POSTS.copy()
        self.rng.shuffle(posts)
        return [self.normalize_post(p) for p in posts[:limit]]

    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        idx = int(post_id) if post_id.isdigit() else 0
        if idx < len(self.POSTS):
            return self.normalize_post(self.POSTS[idx])
        return None

    async def search_hashtag(self, hashtag: str, limit: int = 20) -> List[Dict[str, Any]]:
        tag = hashtag.lower().lstrip("#")
        matched = [p for p in self.POSTS if tag in p["caption"].lower()]
        return [self.normalize_post(p) for p in matched[:limit]]

    async def search_creator(self, handle: str) -> List[Dict[str, Any]]:
        matched = [p for p in self.POSTS if handle.lower() in p["handle"].lower()]
        return [self.normalize_post(p) for p in matched]

    def normalize_post(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "platform": "instagram",
            "post_url": f"https://instagram.com/p/mock_{raw['handle']}",
            "caption": raw["caption"],
            "creator_handle": raw["handle"],
            "followers": raw.get("followers", 0),
            "priority": raw.get("priority", "MEDIUM"),
            "posted_at": datetime.now(timezone.utc).isoformat(),
            "engagement": {
                "likes": self.rng.randint(50, 5000),
                "comments": self.rng.randint(5, 500),
                "shares": self.rng.randint(0, 200),
            },
        }


class OfficialFeedAdapter(SocialSourceAdapter):
    OFFICIAL = [
        {"caption": "Kumbh Mela 2026: All ghats open. Follow official signage.", "source": "Kumbh Authority"},
        {"caption": "Weather alert: Clear skies expected for Amrit Snan.", "source": "Disaster Management"},
    ]

    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [self.normalize_post(p) for p in self.OFFICIAL[:limit]]

    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        return self.normalize_post(self.OFFICIAL[0]) if self.OFFICIAL else None

    async def search_hashtag(self, hashtag: str, limit: int = 20) -> List[Dict[str, Any]]:
        return await self.fetch_posts(limit)

    def normalize_post(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "platform": "official",
            "post_url": "https://kumbh.gov.in/feed",
            "caption": raw["caption"],
            "creator_handle": raw.get("source", "official"),
            "followers": 1000000,
            "priority": "CRITICAL",
            "posted_at": datetime.now(timezone.utc).isoformat(),
            "engagement": {"likes": 0, "comments": 0, "shares": 0},
        }


class InstagramAdapter(SocialSourceAdapter):
    """Placeholder for authorized Instagram API integration."""

    def __init__(self, access_token: str = ""):
        self.access_token = access_token
        self._mock = MockInstagramAdapter()

    async def fetch_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        if not self.access_token:
            return await self._mock.fetch_posts(limit)
        return await self._mock.fetch_posts(limit)

    async def fetch_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        return await self._mock.fetch_post(post_id)

    async def search_hashtag(self, hashtag: str, limit: int = 20) -> List[Dict[str, Any]]:
        return await self._mock.search_hashtag(hashtag, limit)

    def normalize_post(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        return self._mock.normalize_post(raw)
