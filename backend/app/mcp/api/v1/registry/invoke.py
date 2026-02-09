from typing import Annotated

from app.mcp.schema.mcp import CallToolParam
from app.mcp.service.mcp_server_service import mcp_server_service
from common.exception import errors
from common.response.response_schema import response_base
from fastapi import APIRouter, Path
from fastmcp import Client
from fastmcp.mcp_config import MCPConfig

router = APIRouter()


@router.post('/invoke/{username}/{server_name}')
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
