from __future__ import annotations

from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.admin.model import SkillCategory, User


class AgentSkill(Base):
    """agent server"""

    __tablename__ = 'agent_skill'
    id: Mapped[id_key] = mapped_column(init=False)
    # 只允许英文
    name: Mapped[str] = mapped_column(String(255), comment='skill name')
    title: Mapped[str] = mapped_column(String(255), comment='skill title')
    avatar: Mapped[str] = mapped_column(String(255), comment='agent avatar')
    description: Mapped[str] = mapped_column(Text, comment='skill description')
    repository: Mapped[str] = mapped_column(String(255), comment='agent repository')

    # 异步下载
    path: Mapped[str] = mapped_column(String(255), comment='skill path')

    # 是否公开
    is_public: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否公开')

    # 分类一对多
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey('skill_category.id', ondelete='SET NULL'), nullable=True, default=None, comment='skill 分类ID'
    )
    category: Mapped[SkillCategory | None] = relationship(init=False, back_populates='agent_skills')

    # 用户一对多
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey('sys_user.id', ondelete='SET NULL'),
        nullable=True,
        default=None,
        comment='用户关联ID',
    )

    user: Mapped[User | None] = relationship(init=False, back_populates='agent_skills')
