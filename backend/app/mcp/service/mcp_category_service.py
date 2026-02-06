from app.mcp.crud.crud_mcp_category import mcp_category_dao
from database.db import async_db_session


class McpCategoryService:
    @staticmethod
    async def get_recommend_category():
        async with async_db_session() as db:
            stmt = await mcp_category_dao.get_recommend_category()
            result = await db.execute(stmt)
            return result.scalars().all()


mcp_category_service = McpCategoryService()
