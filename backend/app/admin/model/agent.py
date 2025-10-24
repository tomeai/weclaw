from __future__ import annotations

from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import JSON, Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.admin.model import AgentCategory, User


class AgentApp(Base):
    """agent app"""

    __tablename__ = 'agent_app'
    id: Mapped[id_key] = mapped_column(init=False)
    title: Mapped[str] = mapped_column(String(255), comment='agent name')
    description: Mapped[str | None] = mapped_column(Text, default=None, comment='agent描述')
    system_prompt: Mapped[str | None] = mapped_column(Text, default=None, comment='系统提示词')
    prologue: Mapped[str] = mapped_column(Text, default=None, comment='开场白')
    tool: Mapped[str | None] = mapped_column(JSON, default=None, comment='工具列表')
    knowledge: Mapped[str | None] = mapped_column(JSON, default=None, comment='知识库列表')
    database: Mapped[str | None] = mapped_column(JSON, default=None, comment='数据库列表')
    enable_search: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否开启联网搜索')
    enable_multimodal: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否多模态')
    enable_suggest: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='问题建议')
    # 是否公开
    is_public: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否公开')

    # 分类一对多
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey('agent_category.id', ondelete='SET NULL'), nullable=True, default=None, comment='agent 分类ID'
    )
    category: Mapped[AgentCategory | None] = relationship(init=False, back_populates='agents')

    # 用户一对多
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey('sys_user.id', ondelete='SET NULL'),
        nullable=True,
        default=None,
        comment='用户关联ID',
    )

    user: Mapped[User | None] = relationship(init=False, back_populates='agents')
