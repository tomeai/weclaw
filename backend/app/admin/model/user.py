#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from common.model import Base, id_key
from database.db import uuid4_str
from sqlalchemy import VARBINARY, Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import BYTEA, INTEGER
from sqlalchemy.orm import Mapped, mapped_column
from utils.timezone import timezone


class User(Base):
    """用户表"""

    __tablename__ = 'sys_user'

    id: Mapped[id_key] = mapped_column(init=False)
    uuid: Mapped[str] = mapped_column(String(50), init=False, default_factory=uuid4_str, unique=True)
    username: Mapped[str] = mapped_column(String(20), unique=True, index=True, comment='用户名')
    nickname: Mapped[str] = mapped_column(String(20), comment='昵称')
    password: Mapped[str | None] = mapped_column(String(255), comment='密码')
    salt: Mapped[bytes | None] = mapped_column(VARBINARY(255).with_variant(BYTEA(255), 'postgresql'), comment='加密盐')
    email: Mapped[str | None] = mapped_column(String(50), default=None, unique=True, index=True, comment='邮箱')
    phone: Mapped[str | None] = mapped_column(String(11), default=None, comment='手机号')
    avatar: Mapped[str | None] = mapped_column(String(255), default=None, comment='头像')
    status: Mapped[int] = mapped_column(default=1, index=True, comment='用户账号状态(0停用 1正常)')
    is_superuser: Mapped[bool] = mapped_column(
        Boolean().with_variant(INTEGER, 'postgresql'), default=False, comment='超级权限(0否 1是)'
    )
    is_staff: Mapped[bool] = mapped_column(
        Boolean().with_variant(INTEGER, 'postgresql'), default=False, comment='后台管理登陆(0否 1是)'
    )
    join_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), init=False, default_factory=timezone.now, comment='注册时间'
    )
    last_login_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), init=False, onupdate=timezone.now, comment='上次登录时间'
    )
    last_password_changed_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), init=False, onupdate=timezone.now, comment='上次密码变更时间'
    )
