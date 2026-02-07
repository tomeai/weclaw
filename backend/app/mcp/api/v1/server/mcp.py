from typing import Annotated

from app.mcp.schema.mcp import GetMcpDetail, McpBaseDetail, SearchMcpParam
from app.mcp.service.mcp_server_service import mcp_server_service
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseSchemaModel, response_base
from database.db import CurrentSession
from fastapi import APIRouter, Path

router = APIRouter()


@router.post(
    '/search',
    summary='搜索mcp',
    dependencies=[DependsPagination],
)
async def search_mcp(
    db: CurrentSession,
    obj: SearchMcpParam,
) -> ResponseSchemaModel[PageData[McpBaseDetail]]:
    """
    后台基础搜索：关键字搜索，支持排序、分类过滤、分页
    1. 一期支持分类过滤、搜索、分页
    2. 二期支持排序
    Args:
        db:
        obj:

    Returns:

    """
    mcp_select = await mcp_server_service.get_select(keyword=obj.keyword)
    page_data = await paging_data(db, mcp_select)
    return response_base.success(data=page_data)


@router.get('/{username}/{server_name}', summary='mcp detail')
async def get_mcp(
    username: Annotated[str, Path(description='username')], server_name: Annotated[str, Path(description='server_name')]
) -> ResponseSchemaModel[GetMcpDetail | None]:
    result = await mcp_server_service.get_mcp_by_user(username=username, server_name=server_name)
    return response_base.success(data=result)
