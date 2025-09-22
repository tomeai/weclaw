from contextlib import AsyncExitStack
from typing import Optional

import pytest
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


class MCPClient:
    def __init__(self):
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()

    async def connect_to_server(self):
        """
        {
          "mcpServers": {
            "amap-maps": {
              "args": [
                "-y",
                "@amap/amap-maps-mcp-server"
              ],
              "command": "npx",
              "env": {
                "AMAP_MAPS_API_KEY": ""
              }
            }
          }
        }
        """
        server_params = StdioServerParameters(
            command="npx",
            args=["-y", "@amap/amap-maps-mcp-server"],
            env={
                "AMAP_MAPS_API_KEY": "test"
            }
        )

        stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
        self.stdio, self.write = stdio_transport
        self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))

        response = await self.session.initialize()
        capabilities = response.capabilities
        print("capabilities:", capabilities)

        # List available tools
        if capabilities.tools:
            response = await self.session.list_tools()
            tools = response.tools
            print("\n✅ Connected to server with tools:", [tool.name for tool in tools])

        if capabilities.prompts:
            prompts = self.session.list_prompts
            print("prompts:", prompts)

        if capabilities.resources:
            resources = self.session.list_resources
            print("resources:", resources)

        if capabilities.logging:
            logging = self.session.list_logging
            print("logging:", logging)

    async def close(self):
        await self.exit_stack.aclose()


@pytest.mark.asyncio
async def test_connect_to_server():
    client = MCPClient()
    try:
        await client.connect_to_server()
        assert client.session is not None
    finally:
        await client.close()
