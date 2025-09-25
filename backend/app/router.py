#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.mcp.api.router import v1 as mcp_v1
from app.task.api.router import v1 as task_v1
from app.user.api.router import v1 as user_v1
from fastapi import APIRouter

router = APIRouter()

router.include_router(task_v1)
router.include_router(mcp_v1)
router.include_router(user_v1)
