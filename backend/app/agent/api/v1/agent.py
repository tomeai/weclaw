from typing import List

from app.admin.schema.agent import AdminAgentBaseDetail
from app.admin.service.admin_agent_service import agent_admin_server_service
from app.agent.service.agent_server_service import agent_server_service
from app.mcp.schema.agent import AgentCategoryDetail, AgentDetail
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from fastapi import APIRouter, Query, Request

router = APIRouter()


@router.get(
    '/',
    summary='搜索agent',
    dependencies=[DependsPagination],
)
async def search_agent(
    db: CurrentSession,
    keyword: str | None = Query(None, description='搜索词'),
    category_id: int | None = Query(None, description='分类id'),
) -> ResponseSchemaModel[PageData[AgentDetail]]:
    agent_select = await agent_server_service.get_select(keyword=keyword, category_id=category_id)
    page_data = await paging_data(db, agent_select)
    return response_base.success(data=page_data)


@router.get('/categories', summary='agent categories')
async def get_agent_categories() -> ResponseSchemaModel[List[AgentCategoryDetail]]:
    result = await agent_server_service.get_categories()
    return response_base.success(data=result)


@router.get(
    '/mine',
    summary='获取我的 Agent 列表',
    dependencies=[DependsJwtAuth, DependsPagination],
)
async def get_my_agents(
    request: Request,
    db: CurrentSession,
) -> ResponseSchemaModel[PageData[AdminAgentBaseDetail]]:
    agent_select = await agent_admin_server_service.get_my_agents(user_id=request.user.id)
    page_data = await paging_data(db, agent_select)
    return response_base.success(data=page_data)
