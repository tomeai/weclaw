from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.schema.mcp import AddMcpServerParam
from app.task.tasks.tasks import compile_mcp_server
from common.response.response_schema import ResponseModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import async_db_session
from fastapi import APIRouter
from starlette.requests import Request

router = APIRouter(prefix='/deploy')


@router.post('/package', summary='编译mcp package', dependencies=[DependsJwtAuth])
async def compile_package(request: Request, obj: AddMcpServerParam) -> ResponseModel:
    """
    编译mcp package
    :param request:
    :param obj:
    :return:
    """
    # 校验 server_title 是否已存在
    async with async_db_session() as db:
        existing = await mcp_server_dao.get_by_server_title(db, obj.server_title)
        if existing:
            return response_base.fail(msg=f'server_title "{obj.server_title}" already exists')

    username = request.user.username
    result = compile_mcp_server.apply_async((username, obj.model_dump()))
    return response_base.success(data={'task_id': result.id, 'status': result.status})


@router.post(
    '/openapi',
    summary='编译mcp openapi',
)
async def compile_openapi(request: Request) -> ResponseModel:
    """
    编译mcp openapi
    :param request:
    :return:
    """
