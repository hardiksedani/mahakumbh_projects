from celery import Celery
from app.core.config import settings

celery_app = Celery("kumbhrakshak", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(task_serializer="json", result_serializer="json", accept_content=["json"])


@celery_app.task(name="process_camera_frame")
def process_camera_frame(camera_id: str, frame_path: str):
    return {"camera_id": camera_id, "status": "processed"}


@celery_app.task(name="process_social_post")
def process_social_post(post_id: str):
    return {"post_id": post_id, "status": "processed"}


@celery_app.task(name="generate_embedding")
def generate_embedding(text: str):
    from app.ai.providers.factory import get_embedding_provider
    emb = get_embedding_provider()
    return emb.embed([text])[0]
