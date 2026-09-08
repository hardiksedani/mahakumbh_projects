import pytest

from app.core.config import get_model_config


@pytest.fixture(autouse=True)
def clear_config_cache():
    get_model_config.cache_clear()
    yield
    get_model_config.cache_clear()
