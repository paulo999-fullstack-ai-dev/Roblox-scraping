from celery import Celery
from config import settings

celery = Celery(
    "roblox_scraper",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["tasks"]
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Beat schedule for periodic tasks
celery.conf.beat_schedule = {
    "scrape-games-every-hour": {
        "task": "tasks.scrape_games",
        "schedule": 3600.0,  # Every hour
    },
    "update-analytics-daily": {
        "task": "tasks.update_analytics",
        "schedule": 86400.0,  # Every day
    },
} 