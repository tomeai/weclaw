#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from app.admin.service.oauth2_service import oauth2_service
from common.enums import UserSocialType
from common.response.response_schema import ResponseSchemaModel, response_base
from core.conf import settings
from fastapi import APIRouter, BackgroundTasks, Depends, Request, Response
from fastapi_limiter.depends import RateLimiter
from fastapi_oauth20 import FastAPIOAuth20, GiteeOAuth20
from starlette.responses import RedirectResponse

router = APIRouter(prefix='/gitee')

gitee_client = GiteeOAuth20(settings.OAUTH2_GITEE_CLIENT_ID, settings.OAUTH2_GITEE_CLIENT_SECRET)


@router.get('', summary='获取 Gitee 授权链接')
async def get_gitee_oauth2_url(request: Request) -> ResponseSchemaModel[str]:
    auth_url = await gitee_client.get_authorization_url(redirect_uri=f'{request.url}/callback')
    return response_base.success(data=auth_url)


@router.get(
    '/callback',
    summary='Gitee 授权自动重定向',
    description='Gitee 授权后，自动重定向到当前地址并获取用户信息，通过用户信息自动创建系统用户',
    dependencies=[Depends(RateLimiter(times=5, minutes=1))],
)
async def gitee_oauth2_callback(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    oauth2: FastAPIOAuth20 = Depends(FastAPIOAuth20(gitee_client, redirect_route_name='github_oauth2_callback')),
):
    token, _state = oauth2
    access_token = token['access_token']
    user = await gitee_client.get_userinfo(access_token)
    data = await oauth2_service.create_with_login(
        request=request,
        response=response,
        background_tasks=background_tasks,
        user=user,
        social=UserSocialType.github,
    )
    return RedirectResponse(
        url=f'{settings.OAUTH2_FRONTEND_REDIRECT_URI}?access_token={data.access_token}&session_uuid={data.session_uuid}'
    )
