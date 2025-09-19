#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from app.task.celery import celery_app
from app.task.service.serverless_service import serverless_service


@celery_app.task(name='create_serverless')
async def create_serverless(mcp_server_id, function_name, image, envs, run_cmd):
    return await serverless_service.create_serverless(mcp_server_id, function_name, image, envs, run_cmd)
