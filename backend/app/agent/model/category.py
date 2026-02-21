from __future__ import annotations

from common.model import Base, id_key
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column


class AgentCategory(Base):
    """agent category"""

    __tablename__ = 'agent_category'
    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(20), unique=True, comment='类目名称')
    is_recommend: Mapped[bool] = mapped_column(default=False, comment='是否推荐类目')
