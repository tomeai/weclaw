#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime
from typing import Any, Dict, List, Optional, Self

from common.schema import SchemaBase
from fastmcp.mcp_config import StdioMCPServer
from pydantic import BaseModel, Field, field_validator, model_validator


class GetMcpDetail(SchemaBase):
    id: int = Field(description='id')
    server_title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    server_type: str | None = Field(None, description='类型')
    server_metadata: Dict[str, Any] | None = Field(None, description='能力')
    tools: List[Dict[str, Any]] | None = Field(None, description='工具')
    prompts: List[Dict[str, Any]] | None = Field(None, description='提示词')
    resources: List[Dict[str, Any]] | None = Field(None, description='资源')
    envs: Dict[str, Any] | None = Field(None, description='环境变量')


class McpBaseDetail(SchemaBase):
    # id: int = Field(description='id')
    # server_title: str = Field(description='名称')
    server_name: str = Field(description='mcp name')
    description: str | None = Field(None, description='描述')
    server_type: str = Field(description='类型')
    avatar: str | None = Field(description='avatar')
    # user: GetUserInfo = Field(description='用户信息')


class McpSearchDetail(McpBaseDetail):
    # tools: List[Dict[str, Any]] | None = Field(None, description='工具')
    # prompts: List[Dict[str, Any]] | None = Field(None, description='提示词')
    # resources: List[Dict[str, Any]] | None = Field(None, description='资源')

    # @model_validator(mode="after")
    # def handle(self):
    #     self.tools = len(self.tools) if self.tools else 0
    #     self.prompts = len(self.prompts) if self.prompts else 0
    #     self.resources = len(self.resources) if self.resources else 0
    #     return self
    tools: int = Field(description='工具数量')
    prompts: int = Field(description='提示词数量')
    resources: int = Field(description='资源数量')
    call_count: int = Field(description='调用量')
    owner: str = Field(description='owner')

    @model_validator(mode='before')
    @classmethod
    def handel(cls, data: Any) -> Self:
        data['tools'] = len(data['tools']) if data['tools'] else 0
        data['prompts'] = len(data['prompts']) if data['prompts'] else 0
        data['resources'] = len(data['resources']) if data['resources'] else 0
        data['call_count'] = 1889
        data['owner'] = data['user']['username']
        return data


class McpRecommendDetail(SchemaBase):
    # server_title: str = Field(description='名称')
    server_name: str = Field(description='mcp name')
    description: str | None = Field(None, description='描述')
    server_type: str = Field(description='类型')
    # capabilities: Dict[str, Any] | None = Field(None, description='能力')
    # tools: int | None = Field(None, description='工具数量')
    # user: GetUserInfo | None = Field(None, description='user')
    owner: str = Field(description='owner')

    @model_validator(mode='before')
    @classmethod
    def handel(cls, data: Any) -> Self:
        data.owner = data.user.username
        return data

    # @model_validator(mode='before')
    # @classmethod
    # def handel(cls, data: Any) -> Self:
    #     # data.capabilities = data.server_metadata['capabilities']
    #     data.tools = len(data.tools)
    #     return data


class GetMcpRecommendDetail(SchemaBase):
    """ """

    id: int = Field(description='id')
    name: str | None = Field(None, description='分类名称')
    mcp_servers: List[McpRecommendDetail] | None = Field(None, description='servers', serialization_alias='servers')


class GetMcpFeedDetail(SchemaBase):
    """ """

    id: int = Field(description='id')
    server_title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    server_config: Dict[str, Any] | None = Field(None, description='元信息')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间')


class SearchMcpParam(SchemaBase):
    category_id: int | None = Field(None, description='分类id')
    keyword: str | None = Field(None, description='搜索词')


class UpdateMcpServerParam(SchemaBase):
    mcp_endpoint: str = Field(None, description='mcp server endpoint')
    capabilities: Optional[Dict[str, Any]] | None = Field(None, description='能力')
    tools: Optional[Dict[str, Any]] | None = Field(None, description='工具')
    prompts: Optional[Dict[str, Any]] | None = Field(None, description='提示词')
    resources: Optional[Dict[str, Any]] | None = Field(None, description='资源')
    is_public: bool = Field(None, description='是否公开')


class McpServersWrapper(BaseModel):
    mcpServers: Dict[str, StdioMCPServer]


class AddMcpServerParam(BaseModel):
    server_title: str = Field(description='server_title')
    description: str | None = Field(None, description='描述')
    mcpServers: McpServersWrapper = Field(description='mcp server config')

    # @field_validator('git')
    # def validate_git(cls, v: Optional[str]) -> Optional[str]:
    #     if v is None:
    #         return v
    #     git_regex = re.compile(r'^(?:https:\/\/|git@|git:\/\/)([\w.@:/\-~]+)(\.git)?$')
    #     if not git_regex.match(v):
    #         raise ValueError(f'Invalid git URL: {v}')
    #     return v

    @field_validator('mcpServers')
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
