from fastapi import APIRouter
from loguru import logger
from starlette.requests import Request

from app.mcp.schema.mcp import AddMcpServerParam
from app.mcp.service.mcp_server_service import mcp_server_service
from app.task.celery_task.tasks import create_serverless
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

    # 根据用户判断创建的 mcpServer
    mcp_server = list(obj.mcpServers.items())[0]

    mcp_title, mcp_config = mcp_server
    base_command = mcp_server_service.compile_command(mcp_config)
    image = mcp_server_service.get_base_image(mcp_config.command)
    logger.info(f'mcp_title: {mcp_title}, base_command: {base_command}, image:{image}, env: {mcp_config.env}')

    # 先写入数据库 根据登录用户
    exist, mcp_server_id = await mcp_server_service.add_mcp(request, mcp_title, obj, base_command, image)
    print(mcp_server_id)
    if not exist:
        result = create_serverless.apply_async((mcp_server_id, mcp_title, image, mcp_config.env, base_command))
        logger.info(f'result: {result}')

    # todo: 前端实时查询
    return response_base.success()


@router.post(
    '/remote',
    summary='编译mcp remote',
)
async def compile_remote(request: Request) -> ResponseModel:
    """
    转换
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
    :param request:
    :return:
    """
