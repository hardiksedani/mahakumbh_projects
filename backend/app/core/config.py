from functools import lru_cache
from pathlib import Path
from typing import List

import yaml
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Firebase Firestore
    firebase_project_id: str = ""
    firebase_service_account_path: str = ""
    firebase_service_account_json: str = ""
    firebase_use_memory: bool = True

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    openai_api_key: str = ""
    llm_provider: str = "mock"
    vision_llm_provider: str = "mock"

    cors_origins: str = "http://localhost:3000"
    environment: str = "development"
    log_level: str = "INFO"

    yolo_model: str = "yolov8n.pt"
    whisper_model: str = "base"
    simulation_seed: int = 42
    major_snan_mode: bool = False

    n8n_webhook_url: str = ""
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_model_config() -> dict:
    config_path = Path(__file__).parent.parent.parent / "model_config.yaml"
    if config_path.exists():
        with open(config_path) as f:
            return yaml.safe_load(f) or {}
    return {}

settings = get_settings()
