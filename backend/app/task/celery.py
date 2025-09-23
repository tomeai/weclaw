#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

import celery
import celery_aio_pool

from app.task.tasks.beat import LOCAL_BEAT_SCHEDULE
from core.conf import settings

from backend.core.path_conf import BASE_PATH


def find_task_packages():
    packages = []
    task_dir = os.path.join(BASE_PATH, 'app', 'task', 'tasks')
    for root, dirs, files in os.walk(task_dir):
        if 'tasks.py' in files:
            package = root.replace(str(BASE_PATH.parent) + os.path.sep, '').replace(os.path.sep, '.')
            packages.append(package)
    return packages


def init_celery() -> celery.Celery:
    """初始化 Celery 应用"""

    # TODO: Update this work if celery version >= 6.0.0
    # https://github.com/fastapi-practices/fastapi_best_architecture/issues/321
    # https://github.com/celery/celery/issues/7874
    celery.app.trace.build_tracer = celery_aio_pool.build_async_tracer
    celery.app.trace.reset_worker_optimizations()

    app = celery.Celery(
        'wemcp_celery',
        enable_utc=False,
        timezone=settings.DATETIME_TIMEZONE,
        broker_url=f'redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.CELERY_BROKER_REDIS_DATABASE}',
        broker_connection_retry_on_startup=True,
        result_backend=f'db+{settings.DATABASE_TYPE}+{"pymysql" if settings.DATABASE_TYPE == "mysql" else "psycopg"}'
        f'://{settings.DATABASE_USER}:{settings.DATABASE_PASSWORD}@{settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_SCHEMA}',
        result_extended=True,
        beat_schedule=LOCAL_BEAT_SCHEDULE,
        beat_scheduler='app.task.schedulers:DatabaseScheduler',
        task_cls='app.task.tasks.base:TaskBase',
        task_track_started=True,
    )
    app.loader.override_backends = {'db': 'app.task.database:DatabaseBackend'}

    # 自动发现任务
    packages = find_task_packages()
    app.autodiscover_tasks(packages)
    return app


# 创建 Celery 实例
celery_app: celery.Celery = init_celery()
