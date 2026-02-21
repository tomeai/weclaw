from app.admin.crud.crud_admin_agent_category import agent_admin_category_dao
from app.admin.schema.category import AddCategoryParam
from common.exception import errors
from database.db import async_db_session
from fastapi import Request
from sqlalchemy import Select


class AgentAdminCategoryService:
    @staticmethod
    async def get_list(is_recommend: int) -> Select:
        return await agent_admin_category_dao.get_list(is_recommend)

    @staticmethod
    async def create(*, request: Request, obj: AddCategoryParam) -> None:
        async with async_db_session.begin() as db:
            if await agent_admin_category_dao.get_category_by_name(db, obj.name):
                raise errors.ConflictError(msg='分类名称已存在')
            await agent_admin_category_dao.add(db, obj)


agent_admin_category_service: AgentAdminCategoryService = AgentAdminCategoryService()
