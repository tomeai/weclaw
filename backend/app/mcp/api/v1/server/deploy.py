from app.mcp.schema.mcp import AddMcpServerParam
from app.task.tasks.tasks import compile_mcp_server
from common.response.response_schema import ResponseModel, response_base
from common.security.jwt import DependsJwtAuth
from fastapi import APIRouter
from starlette.requests import Request

router = APIRouter()


@router.post('/package', summary='编译mcp package', dependencies=[DependsJwtAuth])
async def compile_package(request: Request, obj: AddMcpServerParam) -> ResponseModel:
    """
    编译mcp package
    :param request:
    :param obj:
    :return:
    """
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
