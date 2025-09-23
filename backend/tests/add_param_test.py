from fastmcp.mcp_config import MCPConfig

from app.mcp.schema.mcp import AddMcpServerParam

data = {
    'git': 'adad', 'description': 'brave搜索', 'deploy_type': 'mcp_gateway', 'mcpServers': {
        'brave-search-test2': {'command': 'npx', 'args': ['-y', '@modelcontextprotocol/server-brave-search'],
                               'env': {'BRAVE_API_KEY': 'YOUR_API_KEY_HERE'}}}}
param = AddMcpServerParam(**data)

print(param)

mcp_config = MCPConfig(mcpServers=param.mcpServers)
print(mcp_config.model_dump_json())

print("server", mcp_config.mcpServers['brave-search-test2'].env)

# for key, item in mcp_config.mcpServers.items():
#     print(key, item)
#
# print(list(mcp_config.mcpServers.keys())[0])
