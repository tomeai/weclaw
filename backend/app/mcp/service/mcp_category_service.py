from app.mcp.crud.crud_mcp_category import mcp_category_dao
from app.mcp.schema.category import AddCategoryParam
from common.exception import errors
from database.db import async_db_session
from fastapi import Request
from sqlalchemy import Select


class McpCategoryService:
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
            if await mcp_category_dao.get_category_by_name(db, obj.name):
                raise errors.ConflictError(msg='分类名称已存在')
            await mcp_category_dao.add(db, obj)

    @staticmethod
    async def get_list(is_recommend: int) -> Select:
        return await mcp_category_dao.get_list(is_recommend)

    @staticmethod
    async def get_recommend_category():
        async with async_db_session() as db:
            stmt = await mcp_category_dao.get_recommend_category()
            result = await db.execute(stmt)
            categories = result.scalars().all()
            return categories


mcp_category_service = McpCategoryService()
