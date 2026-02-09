from typing import List

from app.agent.service.agent_server_service import agent_server_service
from app.mcp.schema.agent import AgentCategoryDetail, AgentDetail, SearchAgentParam
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseSchemaModel, response_base
from database.db import CurrentSession
from fastapi import APIRouter

router = APIRouter()


@router.post(
    '/search',
    summary='搜索agent',
    dependencies=[DependsPagination],
)
async def search_agent(
    db: CurrentSession,
    obj: SearchAgentParam,
) -> ResponseSchemaModel[PageData[AgentDetail]]:
    agent_select = await agent_server_service.get_select(keyword=obj.keyword, category_id=obj.category_id)
    page_data = await paging_data(db, agent_select)
    return response_base.success(data=page_data)


@router.get('/categories', summary='agent categories')
async def get_agent_categories() -> ResponseSchemaModel[List[AgentCategoryDetail]]:
    result = await agent_server_service.get_categories()
    return response_base.success(data=result)
