#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import BigInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.admin.model import User


class DeployLog(Base):
    """部署日志表"""

    __tablename__ = 'deploy_log'

    id: Mapped[id_key] = mapped_column(init=False)

    task_id: Mapped[str] = mapped_column(String(155), unique=True, index=True, comment='Celery 任务 ID')
    task_status: Mapped[str] = mapped_column(String(50), default='PENDING', comment='任务状态')
    task_result: Mapped[str | None] = mapped_column(Text, default=None, comment='任务结果')
    traceback: Mapped[str | None] = mapped_column(Text, default=None, comment='错误回溯')

    user_id: Mapped[int | None] = mapped_column(BigInteger, default=None, index=True, comment='用户 ID')
    server_title: Mapped[str | None] = mapped_column(String(255), default=None, comment='MCP Server 名称')

    user: Mapped[User | None] = relationship(
        'User',
        primaryjoin='foreign(DeployLog.user_id) == User.id',
        viewonly=True,
        init=False,
        default=None,
    )
