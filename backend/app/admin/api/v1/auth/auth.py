# -*- coding: utf-8 -*-

from app.admin.schema.token import GetLoginToken, GetNewToken
from app.admin.service.auth_service import auth_service
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from fastapi import APIRouter, Request, Response
from pydantic import BaseModel, EmailStr
from starlette.background import BackgroundTasks

router = APIRouter()


class SendCodeParam(BaseModel):
    email: EmailStr


class EmailLoginParam(BaseModel):
    email: EmailStr
    code: str


@router.post('/send-code', summary='发送邮箱验证码')
async def send_email_code(obj: SendCodeParam) -> ResponseModel:
    await auth_service.send_email_code(email=obj.email)
    return response_base.success(msg='验证码已发送')


@router.post('/email-login', summary='邮箱验证码登录')
async def email_login(
    request: Request, response: Response, obj: EmailLoginParam, background_tasks: BackgroundTasks
) -> ResponseSchemaModel[GetLoginToken]:
    data = await auth_service.email_login(
        request=request, response=response, email=obj.email, code=obj.code, background_tasks=background_tasks
    )
    return response_base.success(data=data)


@router.post('/tokens', summary='刷新 token')
async def refresh_token(request: Request) -> ResponseSchemaModel[GetNewToken]:
    data = await auth_service.refresh_token(request=request)
    return response_base.success(data=data)


@router.post('/logout', summary='用户登出')
async def logout(request: Request, response: Response) -> ResponseModel:
    await auth_service.logout(request=request, response=response)
    return response_base.success()
