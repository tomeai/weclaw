#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime
from typing import Any, Dict, List, Optional

from common.schema import SchemaBase
from pydantic import BaseModel, Field, validator


class GetMcpSearchDetail(SchemaBase):
    """
    搜索结果
    """

    id: int = Field(description='id')
    title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    server_type: str | None = Field(None, description='类型')
    capabilities: Dict[str, Any] | None = Field(None, description='能力')
    tools: Dict[str, Any] | None = Field(None, description='工具')
    prompts: Dict[str, Any] | None = Field(None, description='提示词')
    resources: Dict[str, Any] | None = Field(None, description='资源')
    envs: Dict[str, Any] | None = Field(None, description='环境变量')


class GetMcpDetail(SchemaBase):
    id: int = Field(description='id')
    title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    server_type: str | None = Field(None, description='类型')
    capabilities: Dict[str, Any] | None = Field(None, description='能力')
    tools: Dict[str, Any] | None = Field(None, description='工具')
    prompts: Dict[str, Any] | None = Field(None, description='提示词')
    resources: Dict[str, Any] | None = Field(None, description='资源')
    envs: Dict[str, Any] | None = Field(None, description='环境变量')


class McpBaseDetail(SchemaBase):
    id: int = Field(description='id')
    title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    server_type: str | None = Field(None, description='类型')
    capabilities: Dict[str, Any] | None = Field(None, description='能力')
    tools: Dict[str, Any] | None = Field(None, description='工具')


class GetMcpRecommendDetail(SchemaBase):
    """ """

    id: int = Field(description='id')
    name: str | None = Field(None, description='分类名称')
    servers: List[McpBaseDetail] | None = Field(None, description='servers')


class GetMcpFeedDetail(SchemaBase):
    """ """

    id: int = Field(description='id')
    title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    capabilities: Dict[str, Any] | None = Field(None, description='能力')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间')


class SearchMcpParam(SchemaBase):
    category_id: int | None = Field(None, description='分类id')
    keyword: str | None = Field(None, description='搜索词')


class MCPServersConfig(SchemaBase):
    command: str = Field(description='命令')
    args: List[str] = Field(description='参数')
    env: Optional[Dict[str, str]] | None = Field({}, description='Environment variables')


class UpdateMcpServerParam(SchemaBase):
    mcp_endpoint: str = Field(None, description='mcp server endpoint')
    capabilities: Optional[Dict[str, Any]] | None = Field(None, description='能力')
    tools: Optional[Dict[str, Any]] | None = Field(None, description='工具')
    prompts: Optional[Dict[str, Any]] | None = Field(None, description='提示词')
    resources: Optional[Dict[str, Any]] | None = Field(None, description='资源')
    is_public: bool = Field(None, description='是否公开')


class AddMcpServerParam(BaseModel):
    git: str | None = Field(None, description='git address')
    description: str | None = Field(None, description='描述')
    mcpServers: Dict[str, MCPServersConfig] = Field(None, description='mcp server config')

    @validator('mcpServers')
    def validate_mcpservers(cls, v):
        if not v:
            raise ValueError('mcpServers cannot be empty')
        return v


class AddMcpPackageParam(SchemaBase):
    language: str | None = Field(None, description='语言')
    package: str | None = Field(None, description='包名')
    env: Optional[Dict[str, str]] | None = Field({}, description='Environment variables')


class CallToolParam(SchemaBase):
    tool_name: str = Field(description='工具名称')
    arguments: Optional[Dict[str, Any]] = Field(description='工具参数')


class AddMcpParam(SchemaBase):
    """
    部署mcp参数  主要有的只能在本地运行
    1. 直接提供包名部署  uvx npx  暂时支持 （填写包名接口）    mcpproxy转发
        1. 如果部署过 则不允许部署
    2. 解析api  restful_api  直接转发
        1. oauth2.0 授权后可以
        2. key校验的
    3. 服务托管 基于gitlab github  需要 Dockerfile   mcpproxy转发
        1. 直接配置构建命令
        2. 直接配置启动命令
    4. 解析 mcpServer配置进行部署
        1. command: 目前支持  uvx npx
        2. 支持定时更新
        3. 支持参数更新


    {
      "mcpServers": {
        "brave-search": {
          "command": "npx",
          "args": [
            "-y",
            "@modelcontextprotocol/server-brave-search"
          ],
          "env": {
            "BRAVE_API_KEY": "YOUR_API_KEY_HERE"
          }
        }
      }
    }

    构建镜像
        1. uvx python3.10    uv add xxx 安装    uvx xxx 运行
        2. npx node20        pnpm install xxx 安装   npx xxx 运行
    """

    # python3.13  java golang 等
    language: str | None = Field(None, description='语言')
    # 语言版本
    language_version: str | None = Field(None, description='语言版本')
    # pip、node、maven、bun
    deploy_method: str | None = Field(None, description='部署方式')
    # uvx pkg、npx pkg
    run_env: str | None = Field(None, description='运行环境')
    # 构建命令
