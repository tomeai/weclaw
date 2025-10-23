#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from common.enums import UserSocialType
from common.schema import SchemaBase
from pydantic import Field


class UserSocialSchemaBase(SchemaBase):
    """用户社交基础模型"""

    sid: str = Field(description='第三方用户 ID')
    source: UserSocialType = Field(description='社交平台')


class CreateUserSocialParam(UserSocialSchemaBase):
    """创建用户社交参数"""

    user_id: int = Field(description='用户 ID')


class UpdateUserSocialParam(SchemaBase):
    """更新用户社交参数"""
