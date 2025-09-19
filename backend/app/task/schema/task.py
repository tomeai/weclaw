#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Any

from common.schema import SchemaBase
from pydantic import Field


class RunParam(SchemaBase):
    """任务运行参数"""

    name: str = Field(description='任务名称')
    args: list[Any] | None = Field(None, description='任务函数位置参数')
    kwargs: dict[str, Any] | None = Field(None, description='任务函数关键字参数')


class TaskResult(SchemaBase):
    """任务执行结果"""

    result: str = Field(description='任务执行结果')
    traceback: str = Field(description='错误堆栈信息')
    status: str = Field(description='任务状态')
    name: str = Field(description='任务名称')
    args: list[Any] | None = Field(None, description='任务函数位置参数')
    kwargs: dict[str, Any] | None = Field(None, description='任务函数关键字参数')
    worker: str = Field(description='执行任务的 worker')
    retries: int | None = Field(None, description='重试次数')
    queue: str | None = Field(None, description='任务队列')


class CustomContainerConfig(SchemaBase):
    image: str = Field(description='image')
    port: int = Field(description='port')
    command: list[str] = Field(description='command')


class ServerlessParam(SchemaBase):
    environmentVariables: dict[str, Any] = Field(description='环境变量')
    timeout: int = Field(description='函数超时时间')
    instanceConcurrency: int = Field(description='函数并发')
    cpu: float = Field(description='cpu')
    diskSize: int = Field(description='diskSize')
    memorySize: int = Field(description='memorySize')
    handler: str = Field(description='handler')
    runtime: str = Field(description='runtime')
    functionName: str = Field(description='functionName')
    customContainerConfig: CustomContainerConfig = Field(description='customContainerConfig')
