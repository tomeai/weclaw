from typing import List

from fastapi import APIRouter

from app.mcp.schema.mcp import GetMcpFeedDetail, GetMcpRecommendDetail
from app.mcp.service.mcp_category_service import mcp_category_service
from app.mcp.service.mcp_server_service import mcp_server_service
from common.response.response_schema import ResponseSchemaModel, response_base

router = APIRouter()


@router.get('/feed')
async def get_feed() -> ResponseSchemaModel[List[GetMcpFeedDetail] | None]:
    """
    仅显示最近一周的
    """
    result = await mcp_server_service.get_mcp_last_7_day()
    return response_base.success(data=result)


@router.get('/recommend', summary='recommend mcp')
async def get_recommend_category_mcp() -> ResponseSchemaModel[List[GetMcpRecommendDetail] | None]:
    """

    Args:

    Returns:

    """
    result = await mcp_category_service.get_recommend_category()
    return response_base.success(data=result)
