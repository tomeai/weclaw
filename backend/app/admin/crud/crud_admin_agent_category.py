from app.admin.schema.category import AddCategoryParam
from app.agent.model import AgentCategory
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus


class CRUDAgentAdminCategory(CRUDPlus[AgentCategory]):
    async def get_agent_category(self, db: AsyncSession, pk: int) -> AgentCategory:
        return await self.select_model(db, pk)

    async def get_list(self, is_recommend: int | None = None) -> Select:
        filters = {}
        # is_recommend < 0 表示查全部；>=0 时转为 bool 过滤
        if is_recommend is not None and is_recommend >= 0:
            filters['is_recommend'] = bool(is_recommend)
        return await self.select_order('id', 'asc', **filters)

    async def add(self, db: AsyncSession, obj: AddCategoryParam) -> None:
        data = obj.model_dump()
        data['is_recommend'] = bool(data['is_recommend'])
        new_category = self.model(**data)
        db.add(new_category)

    async def get_category_by_name(self, db: AsyncSession, name: str) -> AgentCategory:
        return await self.select_model_by_column(db, name=name)


agent_admin_category_dao: CRUDAgentAdminCategory = CRUDAgentAdminCategory(AgentCategory)
