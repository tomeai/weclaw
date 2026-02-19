#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from __future__ import annotations

import sqlalchemy as sa

from common.model import Base, id_key
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column


class UserSocial(Base):
    """用户社交表（OAuth2）"""

    __tablename__ = 'sys_user_social'

    id: Mapped[id_key] = mapped_column(init=False)
    sid: Mapped[str] = mapped_column(String(255), comment='第三方用户 ID')
    source: Mapped[str] = mapped_column(String(20), comment='第三方用户来源')

    # 逻辑外键
    user_id: Mapped[int] = mapped_column(sa.BigInteger, comment='用户关联ID')
