from typing import Annotated

from app.mcp.schema.mcp import CallToolParam
from app.mcp.service.mcp_server_service import mcp_server_service
from common.response.response_schema import response_base
from fastapi import APIRouter, Path
from mcp import ClientSession
from mcp.client.sse import sse_client

router = APIRouter()


@router.post('/invoke/{mcp_id}')
async def call_tool(mcp_id: Annotated[int, Path(description='mcp_id')], call_param: CallToolParam):
    """
    mcp_gateway / serverless
    根据mcp_id查询 sse_url
    """
    mcp_server = await mcp_server_service.get_mcp(mcp_id)
    async with sse_client(f'{mcp_server.mcp_endpoint}/sse') as streams:
        async with ClientSession(streams[0], streams[1]) as session:
            await session.initialize()
            # maps_geo {'address': '大望路', 'city': '北京'}
            result = await session.call_tool(call_param.tool_name, call_param.arguments)
            return response_base.success(data=result)
