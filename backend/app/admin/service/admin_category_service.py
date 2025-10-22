from app.admin.crud.crud_admin_category import mcp_admin_category_dao
from app.admin.schema.category import AddCategoryParam
from common.exception import errors
from database.db import async_db_session
from fastapi import Request
from sqlalchemy import Select


class McpAdminCategoryService:
    @staticmethod
    async def get_list(is_recommend: int) -> Select:
        return await mcp_admin_category_dao.get_list(is_recommend)

    @staticmethod
    async def create(*, request: Request, obj: AddCategoryParam) -> None:
        """
        添加分类
        Args:
            request:
            obj:

        Returns:

        """
        async with async_db_session.begin() as db:
            if await mcp_admin_category_dao.get_category_by_name(db, obj.name):
                raise errors.ConflictError(msg='分类名称已存在')
            await mcp_admin_category_dao.add(db, obj)


mcp_admin_category_service: McpAdminCategoryService = McpAdminCategoryService()
