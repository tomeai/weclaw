from app.mcp.schema.mcp import AddMcpServerParam
from app.mcp.service.mcp_server_service import mcp_server_service
from app.task.celery_task.tasks import create_serverless
from common.response.response_schema import ResponseModel, response_base
from fastapi import APIRouter
from loguru import logger
from starlette.requests import Request

router = APIRouter()

"""
{
  "mcp_id": xxx,
  "envs": {
  }
}
"""


@router.post(
    '/stdio',
    summary='编译mcp server stdio',
)
async def compile_stdio(request: Request, obj: AddMcpServerParam) -> ResponseModel:
    """
    编译：
    1. 提交到阿里云serverless
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
    '/package',
    summary='编译mcp package',
)
async def compile_package(request: Request) -> ResponseModel:
    """
    编译
    :param request:
    :return:
    """


@router.post(
    '/git',
    summary='编译mcp git',
)
async def compile_git(request: Request) -> ResponseModel:
    """
    编译
    :param request:
    :return:
    """
