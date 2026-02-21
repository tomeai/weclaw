from datetime import datetime

from common.model import Base
from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column


class AgentChat(Base):
    __tablename__ = 'agent_chat'

    thread_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    first_query: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=None)
    chat_title: Mapped[str] = mapped_column(String(200), default='新对话')
    title_generated: Mapped[bool] = mapped_column(default=False)
