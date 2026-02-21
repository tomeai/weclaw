from datetime import datetime
from typing import Any

from app.admin.schema.category import CategoryDetail
from app.admin.schema.user import GetUserDetail
from common.schema import SchemaBase
from pydantic import Field, model_validator


class AdminAgentBaseDetail(SchemaBase):
    id: int = Field(description='id')
    title: str = Field(description='agent 标题')
    avatar: str | None = Field(None, description='头像')
    description: str | None = Field(None, description='描述')
    owner: str = Field(description='创建者')
    tools: int = Field(description='工具数量')
    skills: int = Field(description='技能数量')
    knowledge: int = Field(description='知识库数量')
    databases: int = Field(description='数据库数量')
    is_public: bool | None = Field(None, description='是否公开')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间')

    @model_validator(mode='before')
    @classmethod
    def compute_fields(cls, data: Any) -> Any:
        """从 ORM 对象计算衍生字段"""
        if hasattr(data, '__dict__'):

            def _count(val):
                return len(val) if val else 0

            data.__dict__['owner'] = data.user.username if data.user else ''
            data.__dict__['tools'] = _count(data.tools)
            data.__dict__['skills'] = _count(data.skills)
            data.__dict__['knowledge'] = _count(data.knowledge)
            data.__dict__['databases'] = _count(data.databases)
        return data


class AdminSearchAgentParam(SchemaBase):
    keyword: str | None = Field(None, description='搜索词')
    category_id: int | None = Field(None, description='分类ID')


class GetAdminAgentDetail(SchemaBase):
    id: int = Field(description='id')
    title: str = Field(description='agent 标题')
    avatar: str | None = Field(None, description='头像')
    description: str | None = Field(None, description='描述')
    is_public: bool | None = Field(None, description='是否公开')
    user: GetUserDetail = Field(description='用户信息')
    category: CategoryDetail | None = Field(None, description='分类信息')


class UpdateAgentParam(SchemaBase):
    title: str | None = Field(None, description='标题')
    description: str | None = Field(None, description='描述')
    category_id: int | None = Field(None, description='分类ID')
    is_public: bool | None = Field(None, description='是否公开')
