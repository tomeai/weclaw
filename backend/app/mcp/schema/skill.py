from __future__ import annotations

from typing import Any, Self

from common.schema import SchemaBase
from pydantic import Field, model_validator


class SearchSkillParam(SchemaBase):
    category_id: int | None = Field(None, description='分类id')
    keyword: str | None = Field(None, description='搜索词')


class SkillDetail(SchemaBase):
    name: str = Field(description='skill name')
    description: str | None = Field(None, description='skill描述')
    path: str | None = Field(None, description='skill path')
    owner: str = Field(description='owner')
    favorite_count: int = Field(description='favorite count')

    @model_validator(mode='before')
    @classmethod
    def handle(cls, data: Any) -> Self:
        data['owner'] = data['user']['username']
        data['favorite_count'] = 900
        return data


class SkillCategoryDetail(SchemaBase):
    id: int = Field(description='id')
    name: str = Field(description='分类名称')
