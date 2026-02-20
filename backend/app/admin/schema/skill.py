from datetime import datetime
from typing import Any

from app.admin.schema.category import CategoryDetail
from app.admin.schema.user import GetUserDetail
from common.schema import SchemaBase
from pydantic import Field, model_validator


class AdminSkillBaseDetail(SchemaBase):
    id: int = Field(description='id')
    name: str = Field(description='skill name')
    title: str = Field(description='skill 标题')
    avatar: str | None = Field(None, description='头像')
    description: str | None = Field(None, description='描述')
    repository: str | None = Field(None, description='仓库地址')
    owner: str = Field(description='创建者')
    is_public: bool | None = Field(None, description='是否公开')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间')

    @model_validator(mode='before')
    @classmethod
    def compute_fields(cls, data: Any) -> Any:
        if hasattr(data, '__dict__'):
            data.__dict__['owner'] = data.user.username if data.user else ''
        return data


class AdminSearchSkillParam(SchemaBase):
    keyword: str | None = Field(None, description='搜索词')
    category_id: int | None = Field(None, description='分类ID')


class GetAdminSkillDetail(SchemaBase):
    id: int = Field(description='id')
    name: str = Field(description='skill name')
    title: str = Field(description='skill 标题')
    avatar: str | None = Field(None, description='头像')
    description: str | None = Field(None, description='描述')
    repository: str | None = Field(None, description='仓库地址')
    path: str | None = Field(None, description='skill 路径')
    is_public: bool | None = Field(None, description='是否公开')
    user: GetUserDetail = Field(description='用户信息')
    category: CategoryDetail | None = Field(None, description='分类信息')


class UpdateSkillParam(SchemaBase):
    title: str | None = Field(None, description='标题')
    description: str | None = Field(None, description='描述')
    category_id: int | None = Field(None, description='分类ID')
    is_public: bool | None = Field(None, description='是否公开')
