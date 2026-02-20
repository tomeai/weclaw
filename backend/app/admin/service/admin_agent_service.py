from app.admin.crud.crud_admin_agent import agent_admin_server_dao
from app.admin.crud.crud_admin_agent_category import agent_admin_category_dao
from app.agent.model import AgentServer
from common.exception import errors
from database.db import async_db_session
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession


class AgentAdminServerService:
    @staticmethod
    async def get_all_select(*, keyword: str | None, category_id: int | None) -> Select:
        return await agent_admin_server_dao.get_filter_list(keyword=keyword, category_id=category_id)

    @staticmethod
    async def get_agent(pk: int) -> AgentServer:
        async with async_db_session() as db:
            return await agent_admin_server_dao.get_agent(db, pk)

    @staticmethod
    async def update_agent(
        db: AsyncSession,
        agent_id: int,
        category_id: int | None,
        title: str | None,
        description: str | None,
        is_public: bool | None,
    ) -> int:
        count = 0
        if category_id is not None:
            category = await agent_admin_category_dao.get_agent_category(db, category_id)
            if not category:
                raise errors.NotFoundError(msg='分类不存在')
            count = await agent_admin_server_dao.update_category(db, agent_id, category_id)
        if is_public is not None:
            count = await agent_admin_server_dao.update_is_public(db, agent_id, is_public)
        if title:
            count = await agent_admin_server_dao.update_title(db, agent_id, title)
        if description:
            count = await agent_admin_server_dao.update_description(db, agent_id, description)
        return count

    @staticmethod
    async def delete_agent(db: AsyncSession, agent_id: int) -> int:
        return await agent_admin_server_dao.delete_agent(db, agent_id)

    @staticmethod
    async def get_my_agents(*, user_id: int) -> Select:
        return await agent_admin_server_dao.get_my_agents(user_id=user_id)


agent_admin_server_service: AgentAdminServerService = AgentAdminServerService()
