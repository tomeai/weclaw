from __future__ import annotations

from typing import Any, Self

from common.schema import SchemaBase
from pydantic import Field, model_validator


class SearchAgentParam(SchemaBase):
    category_id: int | None = Field(None, description='分类id')
    keyword: str | None = Field(None, description='搜索词')


class AgentDetail(SchemaBase):
    title: str = Field(description='agent title')
    name: str = Field(description='agent name')
    avatar: str | None = Field(None, description='agent avatar')
    description: str | None = Field(None, description='agent描述')
    owner: str = Field(description='owner')
    tools: int = Field(description='tools count')
    skills: int = Field(description='skills count')
    knowledge: int = Field(description='knowledge count')
    databases: int = Field(description='databases count')

    @model_validator(mode='before')
    @classmethod
    def handle(cls, data: Any) -> Self:
        data['tools'] = len(data['tools']) if data['tools'] else 0
        data['skills'] = len(data['skills']) if data['skills'] else 0
        data['knowledge'] = len(data['knowledge']) if data['knowledge'] else 0
        data['databases'] = len(data['databases']) if data['databases'] else 0
        data['owner'] = data['user']['username']
        return data


class AgentCategoryDetail(SchemaBase):
    id: int = Field(description='id')
    name: str = Field(description='分类名称')
