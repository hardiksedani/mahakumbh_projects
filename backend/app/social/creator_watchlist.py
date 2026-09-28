"""Influencer & Creator Watchlist Manager.
Prioritizes CONTENT over celebrity. Follower reach is used solely for propagation
and potential public impact modeling, never as a surrogate for factual truth.
"""

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class CreatorRecord:
    creator_id: str
    handle: str
    platform: str
    display_name: str
    followers: int
    category: str  # LOCAL_CREATOR, NEWS, TRAVEL, DEVOTEE, SAFETY, OFFICIAL, GENERAL
    known_location: str
    priority_level: str  # HIGH, MEDIUM, STANDARD
    verified_status: bool
    active: bool = True
    last_seen: Optional[str] = None
    source: str = "DEMO_WATCHLIST"


DEFAULT_CREATORS: List[CreatorRecord] = [
    CreatorRecord(
        creator_id="cr-001",
        handle="nashik_police_official",
        platform="x_twitter",
        display_name="Nashik Police Commissionerate",
        followers=245000,
        category="OFFICIAL",
        known_location="Nashik Urban HQ",
        priority_level="HIGH",
        verified_status=True,
        last_seen=datetime.now(timezone.utc).isoformat(),
        source="OFFICIAL_GOVERNMENT_DIRECTORY",
    ),
    CreatorRecord(
        creator_id="cr-002",
        handle="nashik_travel_guide",
        platform="instagram",
        display_name="Nashik Darshan & Kumbh",
        followers=128000,
        category="LOCAL_CREATOR",
        known_location="Panchvati / Godavari",
        priority_level="HIGH",
        verified_status=True,
        last_seen=datetime.now(timezone.utc).isoformat(),
        source="APPROVED_MEDIA_LIST",
    ),
    CreatorRecord(
        creator_id="cr-003",
        handle="kumbh_devotee_99",
        platform="x_twitter",
        display_name="Prayag to Nashik Yatri",
        followers=320,
        category="DEVOTEE",
        known_location="Ram Kund Sector",
        priority_level="STANDARD",
        verified_status=False,
        last_seen=datetime.now(timezone.utc).isoformat(),
        source="CITIZEN_STREAM",
    ),
    CreatorRecord(
        creator_id="cr-004",
        handle="maharashtra_news_live",
        platform="youtube",
        display_name="Maharashtra News Bureau",
        followers=580000,
        category="NEWS",
        known_location="Nashik Press Enclave",
        priority_level="HIGH",
        verified_status=True,
        last_seen=datetime.now(timezone.utc).isoformat(),
        source="ACCREDITED_JOURNALIST_LIST",
    ),
    CreatorRecord(
        creator_id="cr-005",
        handle="sadhu_gram_diaries",
        platform="instagram",
        display_name="Sadhu Gram Seva Group",
        followers=14500,
        category="SAFETY",
        known_location="Sadhu Gram Sector 14",
        priority_level="HIGH",
        verified_status=False,
        last_seen=datetime.now(timezone.utc).isoformat(),
        source="COMMUNITY_VOLUNTEER_DESK",
    ),
]


class CreatorWatchlistManager:
    """Manages verified and community creator handles."""

    def __init__(self):
        self._creators: Dict[str, CreatorRecord] = {c.creator_id: c for c in DEFAULT_CREATORS}

    def list_creators(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        results = list(self._creators.values())
        if category:
            results = [c for c in results if c.category.upper() == category.upper()]
        return [asdict(c) for c in results]

    def get_creator(self, creator_id: str) -> Optional[Dict[str, Any]]:
        c = self._creators.get(creator_id)
        return asdict(c) if c else None

    def add_creator(self, data: Dict[str, Any]) -> Dict[str, Any]:
        cid = data.get("creator_id", f"cr-{len(self._creators) + 1:03d}")
        record = CreatorRecord(
            creator_id=cid,
            handle=data.get("handle", "unknown"),
            platform=data.get("platform", "instagram"),
            display_name=data.get("display_name", "Anonymous"),
            followers=data.get("followers", 0),
            category=data.get("category", "GENERAL"),
            known_location=data.get("known_location", "Nashik"),
            priority_level=data.get("priority_level", "STANDARD"),
            verified_status=data.get("verified_status", False),
            last_seen=datetime.now(timezone.utc).isoformat(),
            source=data.get("source", "MANUAL_INPUT"),
        )
        self._creators[cid] = record
        return asdict(record)
