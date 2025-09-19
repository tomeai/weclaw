#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.task.api.v1.task import router as task_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH, tags=['任务'])

v1.include_router(task_router, prefix='/task')
