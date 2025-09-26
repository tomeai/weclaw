#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING, Any

from common.model import Base, id_key
from sqlalchemy import JSON, Boolean, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.mcp.model import McpCategory
    from app.user.model import User


class TransportType(Enum):
    sse = 'sse'
    http = 'streamable-http'
    stdio = 'stdio'


class ServerType(Enum):
    hosted = 'hosted'
    local = 'local'


class CompileType(Enum):
    package = 'package'
    remote = 'remote'
    artifact = 'artifact'
    openapi = 'openapi'


class RuntimeType(str, Enum):
    mcp_gateway = 'mcp_gateway'
    aliyun_serverless = 'aliyun_serverless'
    tencent_serverless = 'tencent_serverless'


class McpServer(Base):
    """mcp server"""

    __tablename__ = 'mcp_server'
    id: Mapped[id_key] = mapped_column(init=False)

    # 前端搜索名称，可以编辑、修改
    server_title: Mapped[str] = mapped_column(String(255), comment='mcp server title')
    # 默认mcp server name 不可以修改
    server_name: Mapped[str] = mapped_column(String(255), comment='mcp server name')

    # 原始协议: streamable-http、sse、stdio
    transport: Mapped[str | None] = mapped_column(String(20), default=None, comment='streamable-http、sse、stdio')
    # mcp server 类型 hosted、local  对于 playwright、文件操作 等必须在本地执行
    # local 类型的不进行编译，不会生成代理路由
    server_type: Mapped[str | None] = mapped_column(String(20), default=None, comment='hosted、local')
    # 编译类型: package、remote、artifact、openapi
    compile_type: Mapped[str | None] = mapped_column(String(20), default=None, comment='编译类型')
    # 运行环境
    runtime_type: Mapped[str] = mapped_column(String(20), default=None, comment='运行环境')
    # server信息
    server_config: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None, comment='server config')
    # 环境变量
    envs: Mapped[str | None] = mapped_column(JSON, default=None, comment='环境变量')

    # 异步git信息写入
    git: Mapped[str | None] = mapped_column(String(255), default=None, comment='项目地址')
    readme: Mapped[str | None] = mapped_column(Text, default=None, comment='项目介绍')
    # 默认像素头像
    avatar: Mapped[str | None] = mapped_column(String(255), default=None, comment='项目头像')
    # 异步ai总结信息写入: 允许用户填写
    description: Mapped[str | None] = mapped_column(Text, default=None, comment='项目描述')

    # 异步mcp信息写入
    server_metadata: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None, comment='mcp server config')
    tools: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None, comment='工具列表')
    prompts: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None, comment='提示词列表')
    resources: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None, comment='资源列表')

    # 是否公开
    is_public: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否公开')

    # 分类一对多
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey('mcp_category.id', ondelete='SET NULL'), nullable=True, default=None, comment='MCP 分类ID'
    )
    category: Mapped[McpCategory | None] = relationship(init=False, back_populates='servers')

    # 用户一对多
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey('sys_user.id', ondelete='SET NULL'),
        nullable=True,
        default=None,
        comment='用户关联ID',
    )

    user: Mapped[User | None] = relationship(init=False, back_populates='mcps')

    __table_args__ = (UniqueConstraint('user_id', 'server_name', name='uix_user_server_name'),)
