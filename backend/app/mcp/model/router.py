from common.model import Base, id_key
from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column


class McpRouter(Base):
    """mcp server"""

    __tablename__ = 'mcp_router'
    id: Mapped[id_key] = mapped_column(init=False)
    mcp_id: Mapped[int] = mapped_column(init=False)
    mcp_endpoint: Mapped[str | None] = mapped_column(Text, default=None, comment='sse url')
