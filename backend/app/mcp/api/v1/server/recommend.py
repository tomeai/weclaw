from typing import List

from app.mcp.schema.mcp import GetMcpRecommendDetail
from app.mcp.service.mcp_category_service import mcp_category_service
from common.response.response_schema import ResponseSchemaModel, response_base
from fastapi import APIRouter

router = APIRouter()


@router.get('/recommend', summary='recommend mcp')
async def get_recommend_category_mcp() -> ResponseSchemaModel[List[GetMcpRecommendDetail] | None]:
    """
    根据分类推荐mcp
    Args:

    Returns:

    """
    result = await mcp_category_service.get_recommend_category()
    return response_base.success(data=result)
