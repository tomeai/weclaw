from common.schema import SchemaBase
from pydantic import Field


class GetCategoryBase(SchemaBase):
    id: int = Field(description='id')
    name: str = Field(description='分类名称')


class GetCategoryDetail(SchemaBase):
    name: str = Field(description='分类名称')
