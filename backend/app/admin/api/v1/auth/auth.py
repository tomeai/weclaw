# -*- coding: utf-8 -*-

from app.admin.schema.token import GetNewToken
from app.admin.service.auth_service import auth_service
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from fastapi import APIRouter, Request, Response

router = APIRouter()


@router.post('/tokens', summary='刷新 token')
async def refresh_token(request: Request) -> ResponseSchemaModel[GetNewToken]:
    data = await auth_service.refresh_token(request=request)
    return response_base.success(data=data)


@router.post('/logout', summary='用户登出')
async def logout(request: Request, response: Response) -> ResponseModel:
    await auth_service.logout(request=request, response=response)
    return response_base.success()
