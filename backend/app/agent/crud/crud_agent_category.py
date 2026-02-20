from app.agent.model import AgentCategory
from sqlalchemy import select
from sqlalchemy_crud_plus import CRUDPlus


class CRUDAgentCategory(CRUDPlus[AgentCategory]):
    async def get_all_categories(self):
        stmt = select(self.model).order_by(self.model.id)
        return stmt


agent_category_dao: CRUDAgentCategory = CRUDAgentCategory(AgentCategory)
