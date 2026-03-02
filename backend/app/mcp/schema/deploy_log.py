#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime
from typing import Any

from common.schema import SchemaBase
from pydantic import Field, model_validator


class GetDeployLogDetail(SchemaBase):
    id: int = Field(description='id')
    task_id: str = Field(description='Celery 任务 ID')
    task_status: str = Field(description='任务状态')
    task_result: str | None = Field(None, description='任务结果')
    traceback: str | None = Field(None, description='错误回溯')
    server_title: str | None = Field(None, description='MCP 名称')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间')


class AdminDeployLogDetail(GetDeployLogDetail):
    user_id: int | None = Field(None, description='用户 ID')
    username: str | None = Field(None, description='用户名')

    @model_validator(mode='before')
    @classmethod
    def extract_username(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            user = getattr(data, 'user', None)
            if user:
                data.username = user.username
        return data


class AdminSearchDeployLogParam(SchemaBase):
    username: str | None = Field(None, description='用户名')
    server_title: str | None = Field(None, description='MCP 名称')
    task_status: str | None = Field(None, description='任务状态')
