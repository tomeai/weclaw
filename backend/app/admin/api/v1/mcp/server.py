from typing import Annotated

from app.admin.schema.mcp import AdminMcpBaseDetail, AdminSearchMcpParam, GetAdminMcpDetail, UpdateMcpServerParam
from app.admin.service.admin_mcp_service import mcp_admin_server_service
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession, CurrentSessionTransaction
from fastapi import APIRouter, Path

router = APIRouter()


@router.post(
    '',
    summary='返回所有mcp',
    dependencies=[DependsPagination, DependsJwtAuth],
)
async def get_all_mcp(
    db: CurrentSession, obj: AdminSearchMcpParam
) -> ResponseSchemaModel[PageData[AdminMcpBaseDetail]]:
    """

    Args:
        db:
        obj:

    Returns:

    """
    mcp_select = await mcp_admin_server_service.get_all_select(**obj.model_dump())
    page_data = await paging_data(db, mcp_select)
    return response_base.success(data=page_data)


@router.get(
    '/{mcp_id}',
    summary='查询mcp详情',
    dependencies=[DependsJwtAuth],
)
async def get_mcp_server(
    mcp_id: Annotated[int, Path(description='mcp_id')],
) -> ResponseSchemaModel[GetAdminMcpDetail | None]:
    result = await mcp_admin_server_service.get_mcp(mcp_id)
    return response_base.success(data=result)


@router.put(
    '/{mcp_id}',
    summary='查询mcp详情',
    dependencies=[DependsJwtAuth],
)
async def put_mcp_server(
    db: CurrentSessionTransaction, mcp_id: Annotated[int, Path(description='mcp_id')], obj: UpdateMcpServerParam
) -> ResponseModel:
    count = await mcp_admin_server_service.update_mcp(db=db, mcp_id=mcp_id, **obj.model_dump())
    if count > 0:
        return response_base.success()
    return response_base.fail()
