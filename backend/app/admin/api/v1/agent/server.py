from typing import Annotated

from app.admin.schema.agent import AdminAgentBaseDetail, AdminSearchAgentParam, GetAdminAgentDetail, UpdateAgentParam
from app.admin.service.admin_agent_service import agent_admin_server_service
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession, CurrentSessionTransaction
from fastapi import APIRouter, Path

router = APIRouter()


@router.post(
    '',
    summary='返回所有 agent',
    dependencies=[DependsPagination, DependsJwtAuth],
)
async def get_all_agent(
    db: CurrentSession, obj: AdminSearchAgentParam
) -> ResponseSchemaModel[PageData[AdminAgentBaseDetail]]:
    agent_select = await agent_admin_server_service.get_all_select(**obj.model_dump())
    page_data = await paging_data(db, agent_select)
    return response_base.success(data=page_data)


@router.get(
    '/{agent_id}',
    summary='查询 agent 详情',
    dependencies=[DependsJwtAuth],
)
async def get_agent(
    agent_id: Annotated[int, Path(description='agent_id')],
) -> ResponseSchemaModel[GetAdminAgentDetail | None]:
    result = await agent_admin_server_service.get_agent(agent_id)
    return response_base.success(data=result)


@router.put(
    '/{agent_id}',
    summary='更新 agent',
    dependencies=[DependsJwtAuth],
)
async def put_agent(
    db: CurrentSessionTransaction,
    agent_id: Annotated[int, Path(description='agent_id')],
    obj: UpdateAgentParam,
) -> ResponseModel:
    count = await agent_admin_server_service.update_agent(db=db, agent_id=agent_id, **obj.model_dump())
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    '/{agent_id}',
    summary='删除 agent',
    dependencies=[DependsJwtAuth],
)
async def delete_agent(
    db: CurrentSessionTransaction,
    agent_id: Annotated[int, Path(description='agent_id')],
) -> ResponseModel:
    count = await agent_admin_server_service.delete_agent(db=db, agent_id=agent_id)
    if count > 0:
        return response_base.success()
    return response_base.fail()
