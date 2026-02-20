from app.skills.model import AgentSkill
from sqlalchemy import Select
from sqlalchemy.orm import noload, selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDSkill(CRUDPlus[AgentSkill]):
    async def get_list(self, keyword: str | None = None, category_id: int | None = None) -> Select:
        filters = {'is_public': 1}
        if category_id:
            filters['category_id'] = category_id
        if keyword:
            filters['name__like'] = f'%{keyword}%'
        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[
                noload(self.model.category),
                selectinload(self.model.user),
            ],
            **filters,
        )

    async def get_my_skills(self, user_id: int) -> Select:
        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[
                noload(self.model.category),
                selectinload(self.model.user),
            ],
            user_id=user_id,
        )


skill_dao: CRUDSkill = CRUDSkill(AgentSkill)
