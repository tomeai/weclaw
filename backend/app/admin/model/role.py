#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

from common.model import Base, UniversalText, id_key
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column


class Role(Base):
    """角色表"""

    __tablename__ = 'sys_role'

    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(20), unique=True, comment='角色名称')
    status: Mapped[int] = mapped_column(default=1, comment='角色状态（0停用 1正常）')
    is_filter_scopes: Mapped[bool] = mapped_column(default=True, comment='过滤数据权限(0否 1是)')
    remark: Mapped[str | None] = mapped_column(UniversalText, default=None, comment='备注')
