from datetime import datetime, timedelta

from app.mcp.model import McpCategory, McpServer
from app.mcp.schema.mcp import UpdateMcpServerParam
from app.user.model import User
from sqlalchemy import Select, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload, selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDMcpServer(CRUDPlus[McpServer]):
    """
    https://www.cnblogs.com/zhuoss/p/17272732.html
    https://stackoverflow.com/questions/68195361/how-to-properly-handle-many-to-many-in-async-sqlalchemy
    """

    async def update_mcp_server(self, session: AsyncSession, pk: int, obj: UpdateMcpServerParam) -> int:
        return await self.update_model(session, pk, obj)

    async def add_mcp(self, db: AsyncSession, obj: McpServer) -> int:
        db.add(obj)
        await db.flush()
        return obj.id

    async def get_mcp(self, db: AsyncSession, pk: int) -> McpServer:
        return await self.select_model(db, pk)

    async def get_mcp_by_title(self, db: AsyncSession, mcp_user: User, title: str) -> McpServer:
        return await self.select_model_by_column(db, user_id=mcp_user.id, title=title)

    async def get_mcp_last_7_day(self) -> Select:
        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)

        stmt = select(self.model).options(
            # selectinload(self.model.user),
        )

        stmt = stmt.filter(self.model.is_public.is_(True))
        stmt = stmt.filter(self.model.created_time >= seven_days_ago)
        stmt = stmt.order_by(desc(self.model.updated_time))
        return stmt

    async def get_list(self, keyword: str | None = None) -> Select:
        filters = {'is_public': 1}

        if keyword:
            filters['server_title__like'] = f'%{keyword}%'
        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[
                selectinload(self.model.category).options(noload(McpCategory.servers)),
                selectinload(self.model.user).options(noload(User.mcps), noload(User.roles)),
            ],
            **filters,
        )


mcp_server_dao: CRUDMcpServer = CRUDMcpServer(McpServer)
