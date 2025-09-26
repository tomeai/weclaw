#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from common.schema import SchemaBase
from pydantic import EmailStr, Field


class GetUserInfoDetail(SchemaBase):
    """用户信息详情"""

    nickname: str = Field(description='用户昵称')
    avatar: str | None = Field(None, description='头像')


class AuthSchemaBase(SchemaBase):
    """用户认证基础模型"""

    username: str = Field(description='用户名')
    password: str | None = Field(description='密码')


class RegisterUserParam(AuthSchemaBase):
    """用户注册参数"""

    nickname: str | None = Field(None, description='昵称')
    avatar: str | None = Field(None, description='昵称')
    email: EmailStr = Field(examples=['user@example.com'], description='邮箱')


class GetUserInfo(SchemaBase):
    username: str = Field(description='用户名')
