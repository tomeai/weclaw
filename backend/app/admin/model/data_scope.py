from __future__ import annotations

import sqlalchemy as sa

from common.model import Base, id_key
from sqlalchemy.orm import Mapped, mapped_column


class DataScope(Base):
    """数据范围表"""

    __tablename__ = 'sys_data_scope'

    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(sa.String(64), unique=True, comment='名称')
    status: Mapped[int] = mapped_column(default=1, comment='状态（0停用 1正常）')
