## deploy/package接口

```
# 接口接收
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
# 向mcp-gateway提交
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
  "name": "io.github.upstash/context7-mcp",
  "description": "An MCP server that provides [describe what your server does]",
  "status": "active",
  "repository": {
    "url": "https://github.com/upstash/context7",
    "source": "github"
  },
  "version": "1.0.0",
  "packages": [
    {
      "registry_type": "npm",
      "registry_base_url": "https://registry.npmjs.org",
      "identifier": "@upstash/context7-mcp",
      "version": "1.0.0",
      "transport": {
        "type": "stdio"
      },
      "environment_variables": [
        {
          "description": "Your API key for the service",
          "is_required": true,
          "format": "string",
          "is_secret": true,
          "name": "YOUR_API_KEY"
        }
      ]
    }
  ]
}
```