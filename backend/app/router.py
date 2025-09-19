#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.mcp.api.router import v1 as mcp_v1
from app.task.api.router import v1 as task_v1
from core.conf import settings
from fastapi import APIRouter

router = APIRouter(prefix=settings.FASTAPI_API_V1_PATH)

router.include_router(task_v1)
router.include_router(mcp_v1)
