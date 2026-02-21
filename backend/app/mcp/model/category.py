#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.mcp.model import McpServer


class McpCategory(Base):
    """mcp category"""

    __tablename__ = 'mcp_category'
    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(20), unique=True, comment='类目名称')
    is_recommend: Mapped[int] = mapped_column(default=0, comment='是否推荐类目')

    # 只读关联（无 DB 约束，仅用于 ORM 查询加载）
    mcp_servers: Mapped[list[McpServer]] = relationship(
        'McpServer',
        primaryjoin='McpCategory.id == foreign(McpServer.category_id)',
        viewonly=True,
        init=False,
        default_factory=list,
    )
