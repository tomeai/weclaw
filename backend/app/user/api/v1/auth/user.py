from app.user.schema.user import AddUserParam, GetUserInfoDetail, GetUserInfoWithRelationDetail
from app.user.service.user_service import user_service
from common.response.response_schema import ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from fastapi import APIRouter, Request

router = APIRouter()


@router.get('/me', summary='获取当前用户信息', dependencies=[DependsJwtAuth])
async def get_current_user(request: Request) -> ResponseSchemaModel[GetUserInfoWithRelationDetail]:
    data = request.user.model_dump()
    return response_base.success(data=data)


@router.post('/create', summary='创建用户')
async def create_user(request: Request, obj: AddUserParam) -> ResponseSchemaModel[GetUserInfoDetail]:
    await user_service.create(request=request, obj=obj)
    data = await user_service.get_userinfo(username=obj.username)
    return response_base.success(data=data)
