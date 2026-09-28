import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from app.core.config import get_model_config


@pytest.fixture(autouse=True)
def clear_config_cache():
    get_model_config.cache_clear()
    yield
    get_model_config.cache_clear()
