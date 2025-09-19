#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import JSON, Boolean, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.mcp.model import McpCategory
    from app.user.model import User


class DeployMethodEnum(Enum):
    pip = 'pip'
    npm = 'npm'


class McpServer(Base):
    """mcp server"""

    __tablename__ = 'mcp_server'
    id: Mapped[id_key] = mapped_column(init=False)
    # mcp server title
    title: Mapped[str] = mapped_column(String(255), comment='mcp server title')
    # 提交人填写的
    description: Mapped[str | None] = mapped_column(Text, default=None, comment='描述')
    # stdio：本地调用 sse：远程调用 api: 支持配置现有的api
    transport: Mapped[str | None] = mapped_column(String(20), default=None, comment='mcp transport type')
    # mcp类型 remote local  对于 playwright 等必须在本地执行
    server_type: Mapped[str | None] = mapped_column(String(20), default=None, comment='mcp server type')
    # 含有环境变量的mcp server需要用户单独部署
    envs: Mapped[str | None] = mapped_column(JSON, default=None, comment='环境变量')

    # 镜像信息
    # npx uvx 不需要构建
    image: Mapped[str | None] = mapped_column(String(255), default=None, comment='镜像地址')
    build_cmd: Mapped[str | None] = mapped_column(Text, default=None, comment='构建命令')
    run_cmd: Mapped[str | None] = mapped_column(Text, default=None, comment='运行命令')

    # git汇总
    git: Mapped[str | None] = mapped_column(String(255), default=None, comment='项目地址')
    overview: Mapped[str | None] = mapped_column(Text, default=None, comment='介绍')
    summary: Mapped[str | None] = mapped_column(Text, default=None, comment='AI总结的结果')
    avatar: Mapped[str | None] = mapped_column(String(255), default=None, comment='头像')

    # 异步写入
    mcp_endpoint: Mapped[str | None] = mapped_column(Text, default=None, comment='sse url')
    capabilities: Mapped[str | None] = mapped_column(JSON, default=None, comment='能力')
    tools: Mapped[str | None] = mapped_column(JSON, default=None, comment='工具列表')
    prompts: Mapped[str | None] = mapped_column(JSON, default=None, comment='提示词列表')
    resources: Mapped[str | None] = mapped_column(JSON, default=None, comment='资源列表')

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

    __table_args__ = (UniqueConstraint('user_id', 'title', name='uix_user_title'),)
