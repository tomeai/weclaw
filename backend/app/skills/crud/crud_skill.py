from app.admin.model import AgentSkill, User
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
                selectinload(self.model.user).options(
                    noload(User.mcp_servers), noload(User.roles), noload(User.agent_servers), noload(User.agent_skills)
                ),
            ],
            **filters,
        )


skill_dao: CRUDSkill = CRUDSkill(AgentSkill)
