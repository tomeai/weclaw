from app.mcp.schema.mcp import AdminMcpBaseDetail, AdminSearchMcpParam
from app.mcp.service.mcp_server_service import mcp_server_service
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from fastapi import APIRouter

router = APIRouter()


@router.post(
    '/servers',
    summary='返回所有mcp',
    dependencies=[DependsPagination, DependsJwtAuth],
)
async def all_mcp(db: CurrentSession, obj: AdminSearchMcpParam) -> ResponseSchemaModel[PageData[AdminMcpBaseDetail]]:
    """

    Args:
        db:
        obj:

    Returns:

    """
    mcp_select = await mcp_server_service.get_all_select(**obj.model_dump())
    page_data = await paging_data(db, mcp_select)
    return response_base.success(data=page_data)


@router.post(
    '/server/get',
    summary='查询mcp详情',
    dependencies=[DependsPagination, DependsJwtAuth],
)
async def get_mcp_server(db: CurrentSession, obj: AdminSearchMcpParam):
    pass
