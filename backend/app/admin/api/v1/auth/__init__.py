#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.admin.api.v1.auth.auth import router as auth_router
from app.admin.api.v1.auth.user import router as user_router
from fastapi import APIRouter

router = APIRouter(prefix='/auth')

router.include_router(auth_router, tags=['授权'])
router.include_router(user_router, tags=['登录'])
