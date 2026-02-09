from app.agent.crud.crud_agent_category import agent_category_dao
from app.agent.crud.crud_agent_server import agent_server_dao
from database.db import async_db_session
from sqlalchemy import Select


class AgentServerService:
    @staticmethod
    async def get_select(*, keyword: str, category_id: int) -> Select:
        return await agent_server_dao.get_list(keyword, category_id)

    @staticmethod
    async def get_categories() -> list:
        async with async_db_session() as db:
            stmt = await agent_category_dao.get_all_categories()
            result = await db.execute(stmt)
            return result.scalars().all()


agent_server_service: AgentServerService = AgentServerService()
