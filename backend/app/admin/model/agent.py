from __future__ import annotations

from typing import TYPE_CHECKING

from common.model import Base, id_key
from sqlalchemy import JSON, BigInteger, Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.admin.model.category import AgentCategory
    from app.admin.model.user import User


class AgentServer(Base):
    """agent server"""

    __tablename__ = 'agent_server'
    id: Mapped[id_key] = mapped_column(init=False)
    # 只允许英文
    name: Mapped[str] = mapped_column(String(255), comment='agent name')
    title: Mapped[str] = mapped_column(String(255), comment='agent name')
    avatar: Mapped[str] = mapped_column(String(255), comment='agent avatar')
    description: Mapped[str | None] = mapped_column(Text, default=None, comment='agent描述')
    system_prompt: Mapped[str | None] = mapped_column(Text, default=None, comment='系统提示词')
    prologue: Mapped[str] = mapped_column(Text, default=None, comment='开场白')

    # 技能
    tools: Mapped[str | None] = mapped_column(JSON, default=None, comment='工具列表')
    knowledge: Mapped[str | None] = mapped_column(JSON, default=None, comment='知识库列表')
    databases: Mapped[str | None] = mapped_column(JSON, default=None, comment='数据库列表')
    skills: Mapped[str | None] = mapped_column(JSON, default=None, comment='skills列表')

    # 开关
    enable_search: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否开启联网搜索')
    enable_multimodal: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否多模态')
    enable_suggest: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='问题建议')

    # 是否公开
    is_public: Mapped[bool | None] = mapped_column(Boolean, default=False, comment='是否公开')

    # 分类逻辑外键
    category_id: Mapped[int | None] = mapped_column(BigInteger, default=None, index=True, comment='agent 分类ID')

    # 用户逻辑外键
    user_id: Mapped[int | None] = mapped_column(BigInteger, default=None, index=True, comment='用户关联ID')

    # 只读关联（无 DB 约束，仅用于 ORM 查询加载）
    user: Mapped[User | None] = relationship(
        'User',
        primaryjoin='foreign(AgentServer.user_id) == User.id',
        viewonly=True,
        init=False,
        default=None,
    )
    category: Mapped[AgentCategory | None] = relationship(
        'AgentCategory',
        primaryjoin='foreign(AgentServer.category_id) == AgentCategory.id',
        viewonly=True,
        init=False,
        default=None,
    )
