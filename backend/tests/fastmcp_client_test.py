import asyncio

from fastmcp import Client, FastMCP
from fastmcp.mcp_config import MCPConfig

# In-memory server (ideal for testing)
# server = FastMCP("TestServer")
# client = Client(server)

# HTTP server
# client = Client("https://example.com/mcp")

mcp_config = MCPConfig(
    mcpServers={
        "wuying-agentbay-mcp-server": {
            "args": [
                "-y",
                "wuying-agentbay-mcp-server"
            ],
            "command": "npx",
            "env": {
                "APIKEY": "APIKEY"
            }
        }
    }
)
# Local Python script
client = Client(mcp_config)


async def main():
    async with client:
        # Basic server interaction
        await client.ping()

        result = client.initialize_result
        print(result.model_dump_json())

        capabilities = result.capabilities

        # List available operations
        if capabilities.tools:
            tools = await client.list_tools_mcp()
            print(tools.model_dump_json())

        if capabilities.resources:
            resources = await client.list_resources_mcp()
            print(resources.model_dump_json())

        if capabilities.prompts:
            prompts = await client.list_prompts_mcp()
            print(prompts.model_dump())

        # Execute operations
        # result = await client.call_tool("example_tool", {"param": "value"})
        # print(result)


asyncio.run(main())
