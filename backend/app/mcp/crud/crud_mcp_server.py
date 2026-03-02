from datetime import datetime, timedelta

from app.admin.model import User
from app.mcp.model import McpServer
from app.mcp.schema.mcp import UpdateMcpServerParam
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

    async def get_mcp_with_user(self, db: AsyncSession, server_name: str, user_id: int) -> McpServer:
        return await self.select_model_by_column(db, server_name=server_name, user_id=user_id)

    async def get_by_user_and_title(self, db: AsyncSession, user_id: int, server_title: str) -> McpServer | None:
        return await self.select_model_by_column(db, user_id=user_id, server_title=server_title)

    async def get_mcp_by_servername(self, db: AsyncSession, pk: int) -> McpServer:
        return await self.select_model(db, pk)

    async def get_mcp_by_title(self, db: AsyncSession, mcp_user: User, title: str) -> McpServer:
        return await self.select_model_by_column(db, user_id=mcp_user.id, title=title)

    async def get_by_server_title(self, db: AsyncSession, server_title: str) -> McpServer | None:
        return await self.select_model_by_column(db, server_title=server_title)

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

    async def get_recommend_mcp(self) -> Select:
        stmt = (
            select(self.model)
            .where(self.model.is_recommend.is_(True), self.model.is_public.is_(True))
            .options(
                selectinload(self.model.user),
                noload(self.model.category),
            )
            .order_by(desc(self.model.updated_time))
        )
        return stmt

    async def get_list(self, keyword: str | None = None, category_id: int = None) -> Select:
        filters = {'is_public': 1}
        if category_id:
            filters['category_id'] = category_id

        if keyword:
            filters['server_title__like'] = f'%{keyword}%'
        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[
                noload(self.model.category),
                selectinload(self.model.user),
            ],
            **filters,
        )


mcp_server_dao: CRUDMcpServer = CRUDMcpServer(McpServer)
