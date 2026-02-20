from app.skills.model import SkillCategory
from sqlalchemy import select
from sqlalchemy_crud_plus import CRUDPlus


class CRUDSkillCategory(CRUDPlus[SkillCategory]):
    async def get_all_categories(self):
        stmt = select(self.model).order_by(self.model.id)
        return stmt


skill_category_dao: CRUDSkillCategory = CRUDSkillCategory(SkillCategory)
