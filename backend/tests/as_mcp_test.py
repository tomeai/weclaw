import asyncio

from agentscope.mcp import HttpStatefulClient, StdIOStatefulClient
from app.mcp.service.mcp_server_service import mcp_server_service


async def client():
    stateful_client = HttpStatefulClient(
        # 用于标识 MCP 的名称
        name='mcp_services_stateful',
        transport='streamable_http',
        url='https://mcp.amap.com/mcp?key=xxx',
    )
    await stateful_client.connect()
    tools = await stateful_client.list_tools()
    print(tools)
    await stateful_client.close()


async def get_mcp_by_user():
    mcp_configs: list[tuple[str, dict, str]] = []  # (name, config, transport)

    mcp_server = await mcp_server_service.get_mcp_by_user(username='fovegage', server_name='12306-mcp')
    if mcp_server and mcp_server.server_config:
        for mcp_name, mcp_cfg in mcp_server.server_config.get('mcpServers', {}).items():
            mcp_configs.append((mcp_name, mcp_cfg, mcp_server.transport))

    for mcp_name, config, transport in mcp_configs:
        if transport == 'stdio':
            stdio_config = {
                'command': config.get('command'),
                'args': config.get('args'),
                'env': config.get('env'),
                'cwd': config.get('cwd'),
            }
            client = StdIOStatefulClient(
                name=mcp_name,
                **stdio_config,
            )
            await client.connect()
            print(await client.list_tools())
            await client.close()


if __name__ == '__main__':
    asyncio.run(get_mcp_by_user())
    # asyncio.run(client())
