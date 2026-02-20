from app.skills.model import AgentSkill
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload, selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDSkillAdminServer(CRUDPlus[AgentSkill]):
    async def get_skill(self, db: AsyncSession, pk: int) -> AgentSkill:
        return await self.select_model(
            session=db,
            pk=pk,
            load_options=[
                selectinload(self.model.category),
                selectinload(self.model.user),
            ],
        )

    async def update_is_public(self, db: AsyncSession, skill_id: int, is_public: bool) -> int:
        return await self.update_model(db, skill_id, {'is_public': is_public})

    async def update_category(self, db: AsyncSession, skill_id: int, category_id: int) -> int:
        return await self.update_model(db, skill_id, {'category_id': category_id})

    async def update_title(self, db: AsyncSession, skill_id: int, title: str) -> int:
        return await self.update_model(db, skill_id, {'title': title})

    async def update_description(self, db: AsyncSession, skill_id: int, description: str) -> int:
        return await self.update_model(db, skill_id, {'description': description})

    async def get_filter_list(
        self,
        keyword: str | None = None,
        category_id: int | None = None,
    ) -> Select:
        filters = {}
        if category_id:
            filters['category_id'] = category_id
        if keyword:
            filters['title__like'] = f'%{keyword}%'
        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[
                noload(self.model.category),
                selectinload(self.model.user),
            ],
            **filters,
        )

    async def delete_skill(self, db: AsyncSession, skill_id: int) -> int:
        return await self.delete_model(db, skill_id)


skill_admin_server_dao: CRUDSkillAdminServer = CRUDSkillAdminServer(AgentSkill)
