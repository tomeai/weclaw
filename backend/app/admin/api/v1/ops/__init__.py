#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.admin.api.v1.ops.rank import router as rank_router
from app.admin.api.v1.ops.statistics import router as statistics_router
from fastapi import APIRouter

router = APIRouter(prefix='/ops')

router.include_router(statistics_router, tags=['统计'])
router.include_router(rank_router, tags=['排名'])
