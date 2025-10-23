#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.admin.api.v1.oauth.gitee import router as gitee_router
from app.admin.api.v1.oauth.github import router as github_router
from fastapi import APIRouter

router = APIRouter(prefix='/oauth')

router.include_router(github_router, tags=['Github oauth授权'])
router.include_router(gitee_router, tags=['Gitee oauth登录'])
