#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.admin.model.agent import AgentApp
    from app.admin.model.mcp import McpServer


class McpCategory(Base):
    """mcp category"""

    __tablename__ = 'mcp_category'
    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(20), unique=True, comment='类目名称')
    is_recommend: Mapped[bool] = mapped_column(default=False, comment='是否推荐类目')

    # mcp server一对多
    servers: Mapped[list[McpServer]] = relationship(init=False, back_populates='category')


class AgentCategory(Base):
    """agent category"""

    __tablename__ = 'agent_category'
    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(20), unique=True, comment='类目名称')
    is_recommend: Mapped[bool] = mapped_column(default=False, comment='是否推荐类目')

    # mcp server一对多
    agents: Mapped[list[AgentApp]] = relationship(init=False, back_populates='category')
