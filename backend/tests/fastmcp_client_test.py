import asyncio

from fastmcp import Client
from fastmcp.mcp_config import MCPConfig

# In-memory server (ideal for testing)
# server = FastMCP("TestServer")
# client = Client(server)

# HTTP server
# client = Client("https://example.com/mcp")

mcp_config = MCPConfig(
    mcpServers={
        '12306-mcp': {'args': ['-y', '12306-mcp'], 'command': 'npx'}
        # 'amap-maps-streamableHTTP': {'url': 'https://mcp.amap.com/mcp?key=您在高德官网上申请的key'},
        # "amap-maps": {
        #     "type": "streamable_http",
        #     "url": "https://mcp.api-inference.modelscope.net/d1f3517751d743/mcp"
        # }
        # 'amap-maps': {
        #     'type': 'streamable_http',
        #     'url': 'https://mcp.api-inference.modelscope.net/b977104b502e4b/mcp',
        #     'headers': {'Authorization': 'Bearer ms-d5361e07-3b6c-47d6-ba4a-701700fe0244'},
        # },
        # "amap-maps": {
        #     "type": "sse",
        #     "url": "https://mcp.api-inference.modelscope.net/da78b66c6ceb44/sse"
        # }
        # 'wuying-agentbay-mcp-server': {
        #     'args': ['-y', 'wuying-agentbay-mcp-server'],
        #     'command': 'npx',
        #     'env': {'APIKEY': 'APIKEY'},
        # },
        # "amap-maps": {
        #     "args": [
        #         "-y",
        #         "@amap/amap-maps-mcp-server"
        #     ],
        #     "command": "npx",
        #     "env": {
        #         "AMAP_MAPS_API_KEY": "xx"
        #     }
        # },
        # "amap-maps": {
        #     "args": [
        #         "-y",
        #         "@amap/amap-maps-mcp-server"
        #     ],
        #     "command": "npx",
        #     "env": {
        #         "AMAP_MAPS_API_KEY": "AMAP_MAPS_API_KEY"
        #     }
        # },
        # "bing-search": {
        #     "args": [
        #         "-y",
        #         "bing-cn-mcp"
        #     ],
        #     "command": "npx"
        # }
    }
)

print(mcp_config)
print(mcp_config.mcpServers)
# Local Python script
client = Client(mcp_config)


async def main():
    async with client:
        # Basic server interaction
        await client.ping()

        result = client.initialize_result
        print('result', result.model_dump_json())

        capabilities = result.capabilities

        # List available operations
        if capabilities.tools:
            tools = await client.list_tools_mcp()
            print('tools', tools.model_dump_json())

        if capabilities.resources:
            resources = await client.list_resources_mcp()
            print('resources', resources.model_dump_json())

        if capabilities.prompts:
            prompts = await client.list_prompts_mcp()
            print('prompts', prompts.model_dump())

        # Execute operations
        # result = await client.call_tool("example_tool", {"param": "value"})
        # print(result)


asyncio.run(main())
