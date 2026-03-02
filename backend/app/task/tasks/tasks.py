#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.mcp.crud.crud_deploy_log import deploy_log_dao
from app.task.celery import celery_app
from app.task.model.result import Task as TaskResult
from app.task.service.compile_mcp_service import compile_mcp_service
from app.task.service.serverless_service import serverless_service
from database.db import async_db_session
from loguru import logger
from sqlalchemy import select


@celery_app.task(name='create_serverless')
async def create_serverless(mcp_server_id, function_name, image, envs, run_cmd):
    return await serverless_service.create_serverless(mcp_server_id, function_name, image, envs, run_cmd)


@celery_app.task(name='compile_mcp_server')
async def compile_mcp_server(mcp_user, mcp_server_param):
    return await compile_mcp_service.compile_mcp_by_mcp_config(mcp_user, mcp_server_param)


@celery_app.task(name='sync_deploy_logs')
async def sync_deploy_logs():
    """定时从 task_result 表同步任务状态到 deploy_log"""
    async with async_db_session.begin() as db:
        pending_logs = await deploy_log_dao.get_pending(db)
        if not pending_logs:
            return

        task_ids = [log.task_id for log in pending_logs]
        stmt = select(TaskResult).where(TaskResult.task_id.in_(task_ids))
        result = await db.execute(stmt)
        task_map = {row.task_id: row for row in result.scalars().all()}

        for log in pending_logs:
            tr = task_map.get(log.task_id)
            if not tr:
                continue
            if tr.status == log.task_status:
                continue
            task_result_str = str(tr.result) if tr.result is not None else None
            await deploy_log_dao.update_status(
                db,
                pk=log.id,
                task_status=tr.status,
                task_result=task_result_str,
                traceback=tr.traceback,
            )
            logger.info(f'sync_deploy_logs: task_id={log.task_id} status {log.task_status} -> {tr.status}')
