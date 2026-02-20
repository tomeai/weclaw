from typing import Annotated, List

from app.admin.schema.mcp import MyMcpDetail
from app.admin.service.admin_mcp_service import mcp_admin_server_service
from app.mcp.schema.category import GetCategoryBase
from app.mcp.schema.mcp import (
    CallToolParam,
    GetMcpDetail,
    GetMcpFeedDetail,
    GetMcpRecommendDetail,
    McpRecommendDetail,
    McpSearchDetail,
)
from app.mcp.service.mcp_category_service import mcp_category_service
from app.mcp.service.mcp_server_service import mcp_server_service
from common.exception import errors
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from fastapi import APIRouter, Path, Query, Request
from fastmcp import Client
from fastmcp.mcp_config import MCPConfig

router = APIRouter()


@router.get(
    '/',
    summary='搜索mcp',
    dependencies=[DependsPagination],
)
async def search_mcp(
    db: CurrentSession,
    keyword: str | None = Query(None, description='搜索词'),
    category_id: int | None = Query(None, description='分类id'),
) -> ResponseSchemaModel[PageData[McpSearchDetail]]:
    mcp_select = await mcp_server_service.get_select(keyword=keyword, category_id=category_id)
    page_data = await paging_data(db, mcp_select)
    return response_base.success(data=page_data)


@router.get('/recommend', summary='推荐mcp列表')
async def get_recommend_mcp() -> ResponseSchemaModel[List[McpRecommendDetail]]:
    result = await mcp_server_service.get_recommend_mcp()
    return response_base.success(data=result)


@router.get('/categories', summary='mcp categories')
async def get_mcp_categories() -> ResponseSchemaModel[List[GetCategoryBase]]:
    result = await mcp_server_service.get_categories()
    return response_base.success(data=result)


@router.get('/categories/recommend', summary='按分类推荐mcp')
async def get_recommend_category_mcp() -> ResponseSchemaModel[List[GetMcpRecommendDetail] | None]:
    result = await mcp_category_service.get_recommend_category()
    return response_base.success(data=result)


@router.get(
    '/mine',
    summary='获取我的 MCP 列表',
    dependencies=[DependsJwtAuth, DependsPagination],
)
async def get_my_mcps(
    request: Request,
    db: CurrentSession,
) -> ResponseSchemaModel[PageData[MyMcpDetail]]:
    mcp_select = await mcp_admin_server_service.get_my_mcps(user_id=request.user.id)
    page_data = await paging_data(db, mcp_select)
    return response_base.success(data=page_data)


@router.get('/feed', summary='feed', dependencies=[DependsJwtAuth])
async def get_feed() -> ResponseSchemaModel[List[GetMcpFeedDetail] | None]:
    """仅显示最近一周的"""
    result = await mcp_server_service.get_mcp_last_7_day()
    return response_base.success(data=result)


@router.get('/{username}/{server_name}', summary='mcp detail')
async def get_mcp(
    username: Annotated[str, Path(description='username')],
    server_name: Annotated[str, Path(description='server_name')],
) -> ResponseSchemaModel[GetMcpDetail | None]:
    result = await mcp_server_service.get_mcp_by_user(username=username, server_name=server_name)
    return response_base.success(data=result)


@router.post('/{username}/{server_name}/invoke')
async def call_tool(
    username: Annotated[str, Path(description='username')],
    server_name: Annotated[str, Path(description='server_name')],
    call_param: CallToolParam,
):
    mcp_server = await mcp_server_service.get_mcp_by_user(username=username, server_name=server_name)
    if not mcp_server:
        raise errors.NotFoundError(msg='MCP服务器不存在')

    server_config = mcp_server.server_config
    if not server_config or 'mcpServers' not in server_config:
        raise errors.NotFoundError(msg='MCP服务器配置不存在')

    mcp_config = MCPConfig(mcpServers=server_config['mcpServers'])
    client = Client(mcp_config)

    async with client:
        await client.ping()
        result = await client.call_tool(call_param.tool_name, call_param.arguments)
        return response_base.success(data=result)
