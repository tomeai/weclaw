#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import TYPE_CHECKING

from app.admin.model.m2m import sys_user_role
from common.model import Base, id_key
from sqlalchemy import String
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.dialects.postgresql import TEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.user.model import User


class Role(Base):
    """角色表"""

    __tablename__ = 'sys_role'

    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(20), unique=True, comment='角色名称')
    status: Mapped[int] = mapped_column(default=1, comment='角色状态（0停用 1正常）')
    remark: Mapped[str | None] = mapped_column(
        LONGTEXT().with_variant(TEXT, 'postgresql'), default=None, comment='备注'
    )

    users: Mapped[list[User]] = relationship(init=False, secondary=sys_user_role, back_populates='roles')
