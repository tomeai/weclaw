#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 参考：https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
from celery.schedules import schedule

LOCAL_BEAT_SCHEDULE = {
    '同步部署日志': {
        'task': 'sync_deploy_logs',
        'schedule': schedule(30),  # 每 30 秒同步一次
    },
}
