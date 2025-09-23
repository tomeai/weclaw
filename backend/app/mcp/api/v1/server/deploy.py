from fastapi import APIRouter
from starlette.requests import Request

from app.mcp.schema.mcp import AddMcpServerParam
from app.task.celery_task.tasks import compile_mcp_server
from common.response.response_schema import ResponseModel, response_base

router = APIRouter()


@router.post(
    '/package',
    summary='编译mcp package',
)
async def compile_package(request: Request, obj: AddMcpServerParam) -> ResponseModel:
    """
    接收
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
    提交
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
    1. 提交到阿里云serverless/mcp_gateway
    2. 查询可用的资源 使用官方API
    3. 如果有tool 则获取tool_list
    :param request:
    :param obj:
    :return:
    """
    # 注意校验 不支持传入多个  mcp-gateway支持
    # 根据用户判断创建的 mcpServer

    result = compile_mcp_server.apply_async(('gage', obj.model_dump()))
    return response_base.success(data={
        "task_id": result.id,
        "status": result.status
    })


@router.post(
    '/remote',
    summary='编译mcp remote',
)
async def compile_remote(request: Request) -> ResponseModel:
    """
    使用 fastmcp 进行转换
    from fastmcp import FastMCP, Client

    backend = Client("http://example.com/mcp/sse")
    proxy = FastMCP.as_proxy(backend, name="ProxyServer")
    # Now use the proxy like any FastMCP server
    :param request:
    :return:
    """


@router.post(
    '/openapi',
    summary='编译mcp openapi',
)
async def compile_openapi(request: Request) -> ResponseModel:
    """
    # 如果是openapi格式的 将被转成 mcp http 协议的 数据库侧统一

    import httpx
    from fastmcp import FastMCP

    # From OpenAPI spec
    spec = httpx.get("https://api.example.com/openapi.json").json()
    mcp = FastMCP.from_openapi(openapi_spec=spec, client=httpx.AsyncClient())

    :param request:
    :return:
    """


@router.post(
    '/artifact',
    summary='编译mcp artifact',
)
async def compile_artifact(request: Request) -> ResponseModel:
    """
    部署二进制 java golang rust等
    编译 python 脚本
    :param request:
    :return:
    """
