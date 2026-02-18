from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class ChatBase(DeclarativeBase):
    pass


class ChatThread(ChatBase):
    __tablename__ = 'chat_thread'

    thread_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    first_query: Mapped[str | None] = mapped_column(Text, nullable=True)
    chat_title: Mapped[str] = mapped_column(String(200), default='新对话')
    title_generated: Mapped[bool] = mapped_column(default=False)
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
