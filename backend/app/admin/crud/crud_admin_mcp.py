from app.admin.model import McpCategory, McpServer, User
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload, selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDMcpAdminServer(CRUDPlus[McpServer]):
    async def update_is_public(self, db: AsyncSession, mcp_id, is_public: int) -> int:
        return await self.update_model(db, mcp_id, {'is_public': is_public})

    async def update_category(self, db: AsyncSession, mcp_id, category_id: int) -> int:
        return await self.update_model(db, mcp_id, {'category_id': category_id})

    async def update_server_title(self, db: AsyncSession, mcp_id, server_title: str) -> int:
        return await self.update_model(db, mcp_id, {'server_title': server_title})

    async def update_description(self, db: AsyncSession, mcp_id, description: str) -> int:
        return await self.update_model(db, mcp_id, {'description': description})

    async def get_mcp(self, db: AsyncSession, pk: int) -> McpServer:
        return await self.select_model(
            session=db,
            pk=pk,
            load_options=[
                selectinload(self.model.category).options(noload(McpCategory.servers)),
                selectinload(self.model.user).options(noload(User.mcps), noload(User.roles)),
            ],
        )

    async def get_filter_list(
        self,
        keyword: str | None = None,
        transport: str | None = None,
        server_type: str | None = None,
        is_public: int = 0,
    ) -> Select:
        filters = {
            'is_public': is_public,
        }
        if transport:
            filters['transport'] = transport
        if server_type:
            filters['server_type'] = server_type
        if keyword:
            filters['server_title__like'] = f'%{keyword}%'
            filters['description__like'] = f'%{keyword}%'

        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[
                selectinload(self.model.category).options(noload(McpCategory.servers)),
                selectinload(self.model.user).options(noload(User.mcps), noload(User.roles)),
            ],
            **filters,
        )


mcp_admin_server_dao: CRUDMcpAdminServer = CRUDMcpAdminServer(McpServer)
