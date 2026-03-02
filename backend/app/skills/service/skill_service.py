from app.admin.crud.crud_user import user_dao
from app.skills.crud.crud_skill import skill_dao
from app.skills.crud.crud_skill_category import skill_category_dao
from app.skills.model import AgentSkill
from common.exception import errors
from database.db import async_db_session
from sqlalchemy import Select


class SkillService:
    @staticmethod
    async def get_select(*, keyword: str, category_id: int) -> Select:
        return await skill_dao.get_list(keyword, category_id)

    @staticmethod
    async def get_my_skills(*, user_id: int) -> Select:
        return await skill_dao.get_my_skills(user_id=user_id)

    @staticmethod
    async def get_skill_by_user(username: str, skill_name: str) -> AgentSkill | None:
        async with async_db_session() as db:
            user = await user_dao.get_by_username(db, username)
            if not user:
                raise errors.NotFoundError(msg='用户不存在')
            return await skill_dao.get_skill_by_user(db, skill_name, user.id)

    @staticmethod
    async def get_categories() -> list:
        async with async_db_session() as db:
            stmt = await skill_category_dao.get_all_categories()
            result = await db.execute(stmt)
            return result.scalars().all()


skill_service: SkillService = SkillService()
