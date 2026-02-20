from app.admin.crud.crud_admin_skill import skill_admin_server_dao
from app.admin.crud.crud_admin_skill_category import skill_admin_category_dao
from app.skills.model import AgentSkill
from common.exception import errors
from database.db import async_db_session
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession


class SkillAdminServerService:
    @staticmethod
    async def get_all_select(*, keyword: str | None, category_id: int | None) -> Select:
        return await skill_admin_server_dao.get_filter_list(keyword=keyword, category_id=category_id)

    @staticmethod
    async def get_skill(pk: int) -> AgentSkill:
        async with async_db_session() as db:
            return await skill_admin_server_dao.get_skill(db, pk)

    @staticmethod
    async def update_skill(
        db: AsyncSession,
        skill_id: int,
        category_id: int | None,
        title: str | None,
        description: str | None,
        is_public: bool | None,
    ) -> int:
        count = 0
        if category_id is not None:
            category = await skill_admin_category_dao.get_skill_category(db, category_id)
            if not category:
                raise errors.NotFoundError(msg='分类不存在')
            count = await skill_admin_server_dao.update_category(db, skill_id, category_id)
        if is_public is not None:
            count = await skill_admin_server_dao.update_is_public(db, skill_id, is_public)
        if title:
            count = await skill_admin_server_dao.update_title(db, skill_id, title)
        if description:
            count = await skill_admin_server_dao.update_description(db, skill_id, description)
        return count

    @staticmethod
    async def delete_skill(db: AsyncSession, skill_id: int) -> int:
        return await skill_admin_server_dao.delete_skill(db, skill_id)


skill_admin_server_service: SkillAdminServerService = SkillAdminServerService()
