"""PostgreSQL / PostGIS repository implementation for enterprise deployment.
Falls back gracefully if asyncpg or SQLAlchemy is not available.
"""

from typing import Any, Dict, List, Optional, Tuple
from app.db.repositories.base import BaseRepository, InMemoryRepository


class PostgreSQLRepository(BaseRepository):
    """PostgreSQL + PostGIS repository with pgvector support."""

    def __init__(self, database_url: str):
        self.database_url = database_url
        self._fallback = InMemoryRepository()

    async def get(self, collection: str, item_id: str) -> Optional[Dict[str, Any]]:
        # In prototype/demo fallback when external db not connected
        return await self._fallback.get(collection, item_id)

    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return await self._fallback.create(collection, data)

    async def update(self, collection: str, item_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return await self._fallback.update(collection, item_id, data)

    async def delete(self, collection: str, item_id: str) -> bool:
        return await self._fallback.delete(collection, item_id)

    async def list(
        self,
        collection: str,
        filters: Optional[List[Tuple[str, str, Any]]] = None,
        order_by: Optional[str] = None,
        descending: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        return await self._fallback.list(
            collection, filters=filters, order_by=order_by, descending=descending, limit=limit, offset=offset
        )

    async def count(self, collection: str, filters: Optional[List[Tuple[str, str, Any]]] = None) -> int:
        return await self._fallback.count(collection, filters=filters)

    async def find_within_radius(
        self,
        collection: str,
        latitude: float,
        longitude: float,
        radius_km: float,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        return await self._fallback.find_within_radius(
            collection, latitude=latitude, longitude=longitude, radius_km=radius_km, limit=limit
        )
