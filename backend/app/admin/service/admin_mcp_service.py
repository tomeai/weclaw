from app.admin.crud.crud_admin_category import mcp_admin_category_dao
from app.admin.crud.crud_admin_mcp import mcp_admin_server_dao
from app.admin.model import McpServer
from common.exception import errors
from database.db import async_db_session
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession


class McpAdminServerService:
    @staticmethod
    async def get_all_select(*, keyword: str, transport: str, server_type: str, is_public: int) -> Select:
        return await mcp_admin_server_dao.get_filter_list(
            keyword=keyword, transport=transport, server_type=server_type, is_public=is_public
        )

    @staticmethod
    async def get_mcp(pk: int) -> McpServer:
        async with async_db_session() as db:
            return await mcp_admin_server_dao.get_mcp(db, pk)

    @staticmethod
    async def update_mcp(db: AsyncSession, mcp_id: int, category_id: int, server_title: str, description: str):
        category = await mcp_admin_category_dao.get_mcp_category(db, category_id)
        if not category:
            raise errors.NotFoundError(msg='类目不存在')
        if server_title:
            await mcp_admin_server_dao.update_server_title(db, mcp_id, server_title)
        if description:
            await mcp_admin_server_dao.update_description(db, mcp_id, description)


mcp_admin_server_service: McpAdminServerService = McpAdminServerService()
