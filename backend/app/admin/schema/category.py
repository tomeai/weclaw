from datetime import datetime

from common.schema import SchemaBase
from pydantic import Field


class AddCategoryParam(SchemaBase):
    name: str = Field(description='分类名称')
    is_recommend: int = Field(description='是否推荐')


class GetAllCategoryParam(SchemaBase):
    is_recommend: int = Field(description='是否推荐')


class CategoryDetail(SchemaBase):
    id: int = Field(description='id')
    name: str = Field(description='分类名称')
    is_recommend: int = Field(description='是否推荐')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间时间')
