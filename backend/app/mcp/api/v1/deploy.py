from app.admin.crud.crud_user import user_dao
from app.mcp.crud.crud_deploy_log import deploy_log_dao
from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.model.deploy_log import DeployLog
from app.mcp.schema.deploy_log import GetDeployLogDetail
from app.mcp.schema.mcp import AddMcpServerParam
from app.task.tasks.tasks import compile_mcp_server
from common.exception import errors
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession, async_db_session
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
    username = request.user.username
    if not username:
        raise errors.ServerError(msg='username is null')

    async with async_db_session.begin() as db:
        user = await user_dao.get_by_username(db, username)
        if not user:
            raise errors.NotFoundError(msg=f'用户 {username} 不存在')
        existing = await mcp_server_dao.get_by_user_and_title(db, user.id, obj.server_title)
        if existing:
            raise errors.ConflictError(msg=f'已存在同名 MCP：{obj.server_title}')

        result = compile_mcp_server.apply_async((username, obj.model_dump()))

        log = DeployLog(
            task_id=result.id,
            task_status=result.status,
            user_id=user.id,
            server_title=obj.server_title,
        )
        await deploy_log_dao.create(db, log)

    return response_base.success(data={'task_id': result.id, 'task_status': result.status})


@router.get(
    '/logs',
    summary='获取部署日志',
    dependencies=[DependsJwtAuth, DependsPagination],
)
async def get_deploy_logs(
    request: Request,
    db: CurrentSession,
) -> ResponseSchemaModel[PageData[GetDeployLogDetail]]:
    select = await deploy_log_dao.get_user_select(user_id=request.user.id)
    page_data = await paging_data(db, select)
    return response_base.success(data=page_data)


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
