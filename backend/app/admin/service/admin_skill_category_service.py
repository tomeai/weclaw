from app.admin.crud.crud_admin_skill_category import skill_admin_category_dao
from app.admin.schema.category import AddCategoryParam
from common.exception import errors
from database.db import async_db_session
from fastapi import Request
from sqlalchemy import Select


class SkillAdminCategoryService:
    @staticmethod
    async def get_list(is_recommend: int) -> Select:
        return await skill_admin_category_dao.get_list(is_recommend)

    @staticmethod
    async def create(*, request: Request, obj: AddCategoryParam) -> None:
        async with async_db_session.begin() as db:
            if await skill_admin_category_dao.get_category_by_name(db, obj.name):
                raise errors.ConflictError(msg='分类名称已存在')
            await skill_admin_category_dao.add(db, obj)


skill_admin_category_service: SkillAdminCategoryService = SkillAdminCategoryService()
