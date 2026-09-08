from app.ai.providers.embedding_provider import SentenceTransformerProvider
from app.ai.providers.llm_provider import MockLLMProvider, OpenAIProvider
from app.ai.providers.speech_ocr_provider import EasyOCRProvider, WhisperProvider
from app.ai.providers.vision_provider import LocalVisionProvider, MockVisionLLMProvider
from app.core.config import get_model_config, settings


def get_llm_provider():
    config = get_model_config().get("llm", {})
    provider = settings.llm_provider or config.get("provider", "mock")
    if provider == "openai" and settings.openai_api_key:
        return OpenAIProvider(settings.openai_api_key, config.get("model", "gpt-4o-mini"))
    return MockLLMProvider()


def get_vision_provider():
    return LocalVisionProvider()


def get_vision_llm_provider():
    provider = settings.vision_llm_provider or get_model_config().get("vision_llm", {}).get("provider", "mock")
    if provider == "openai" and settings.openai_api_key:
        return MockVisionLLMProvider()
    return MockVisionLLMProvider()


def get_embedding_provider():
    config = get_model_config().get("embedding", {})
    return SentenceTransformerProvider(config.get("model", "all-MiniLM-L6-v2"))


def get_ocr_provider():
    return EasyOCRProvider()


def get_speech_provider():
    config = get_model_config().get("speech", {})
    return WhisperProvider(config.get("model", settings.whisper_model))
