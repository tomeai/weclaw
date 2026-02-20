from app.admin.schema.user import GetCurrentUserInfoWithRelationDetail
from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from fastapi import APIRouter, Request

router = APIRouter()


@router.get('/me', summary='获取当前用户信息', dependencies=[DependsJwtAuth])
async def get_current_user(request: Request) -> ResponseSchemaModel[GetCurrentUserInfoWithRelationDetail]:
    data = request.user.model_dump()
    return response_base.success(data=data)
