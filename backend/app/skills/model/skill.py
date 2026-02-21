from __future__ import annotations

from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import BigInteger, Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.admin.model.user import User
    from app.skills.model import SkillCategory


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

    # 分类逻辑外键
    category_id: Mapped[int | None] = mapped_column(BigInteger, default=None, index=True, comment='skill 分类ID')

    # 用户逻辑外键
    user_id: Mapped[int | None] = mapped_column(BigInteger, default=None, index=True, comment='用户关联ID')

    # 只读关联（无 DB 约束，仅用于 ORM 查询加载）
    user: Mapped[User | None] = relationship(
        'User',
        primaryjoin='foreign(AgentSkill.user_id) == User.id',
        viewonly=True,
        init=False,
        default=None,
    )
    category: Mapped[SkillCategory | None] = relationship(
        'SkillCategory',
        primaryjoin='foreign(AgentSkill.category_id) == SkillCategory.id',
        viewonly=True,
        init=False,
        default=None,
    )
