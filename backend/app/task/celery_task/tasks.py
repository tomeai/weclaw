#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.task.celery import celery_app
from app.task.service.compile_mcp_service import compile_mcp_service
from app.task.service.serverless_service import serverless_service


@celery_app.task(name='create_serverless')
async def create_serverless(mcp_server_id, function_name, image, envs, run_cmd):
    return await serverless_service.create_serverless(mcp_server_id, function_name, image, envs, run_cmd)


@celery_app.task(name='compile_mcp_server')
async def compile_mcp_server(mcp_user, mcp_server_param):
    return await compile_mcp_service.compile_mcp_by_mcp_config(mcp_user, mcp_server_param)
