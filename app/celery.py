# Task imports moved to app/__init__.py to avoid circular imports
from celery import Celery
from app.config import Config

celery = Celery(
    "my_example_celery_app",
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND,
)

celery.conf.update(
    broker_url=Config.CELERY_BROKER_URL,
    result_backend=Config.CELERY_RESULT_BACKEND,
)
celery.autodiscover_tasks(['app.tasks'])
# Task registration moved to app/__init__.py to avoid circular imports
# Explicit registration removed to avoid circular import
