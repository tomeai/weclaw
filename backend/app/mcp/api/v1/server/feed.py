from typing import List

from app.mcp.schema.mcp import GetMcpFeedDetail
from app.mcp.service.mcp_server_service import mcp_server_service
from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from fastapi import APIRouter

router = APIRouter()


@router.get('/feed', summary='feed', dependencies=[DependsJwtAuth])
async def get_feed() -> ResponseSchemaModel[List[GetMcpFeedDetail] | None]:
    """
    仅显示最近一周的
    """
    result = await mcp_server_service.get_mcp_last_7_day()
    return response_base.success(data=result)
