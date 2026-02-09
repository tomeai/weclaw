from app.skills.crud.crud_skill import skill_dao
from app.skills.crud.crud_skill_category import skill_category_dao
from database.db import async_db_session
from sqlalchemy import Select


class SkillService:
    @staticmethod
    async def get_select(*, keyword: str, category_id: int) -> Select:
        return await skill_dao.get_list(keyword, category_id)

    @staticmethod
    async def get_categories() -> list:
        async with async_db_session() as db:
            stmt = await skill_category_dao.get_all_categories()
            result = await db.execute(stmt)
            return result.scalars().all()


skill_service: SkillService = SkillService()
