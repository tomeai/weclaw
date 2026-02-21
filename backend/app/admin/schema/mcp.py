from datetime import datetime

from app.admin.schema.category import CategoryDetail
from app.admin.schema.user import GetUserDetail
from common.schema import SchemaBase
from pydantic import Field


class AdminMcpBaseDetail(SchemaBase):
    id: int = Field(description='id')
    server_title: str = Field(description='名称')
    server_name: str = Field(description='mcp name')
    description: str | None = Field(None, description='描述')
    server_type: str = Field(description='类型')
    compile_type: str = Field(description='编译类型')
    git: str | None = Field(None, description='git地址')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间')


class AdminSearchMcpParam(SchemaBase):
    # category_id: int | None = Field(None, description='分类id')
    keyword: str | None = Field(None, description='搜索词')
    transport: str | None = Field(None, description='协议类型')
    server_type: str | None = Field(None, description='部署类型')
    is_public: int | None = Field(None, description='是否公开')


class GetAdminMcpDetail(SchemaBase):
    id: int = Field(description='id')
    server_name: str = Field(description='mcp name')
    server_title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    server_type: str | None = Field(None, description='类型')
    compile_type: str = Field(description='编译类型')
    git: str | None = Field(None, description='git地址')
    user: GetUserDetail = Field(description='用户信息')
    category: CategoryDetail | None = Field(None, description='分类信息')
    is_public: int | None = Field(None, description='是否公开')


class MyMcpDetail(SchemaBase):
    id: int = Field(description='id')
    server_title: str = Field(description='名称')
    server_name: str = Field(description='mcp name')
    description: str | None = Field(None, description='描述')
    server_type: str = Field(description='类型')
    is_public: bool | None = Field(None, description='是否公开')
    created_time: datetime = Field(description='创建时间')
    updated_time: datetime | None = Field(None, description='更新时间')


class UpdateMcpServerParam(SchemaBase):
    server_title: str | None = Field(None, description='名称')
    description: str | None = Field(None, description='描述')
    category_id: int | None = Field(None, description='分类ID')
    is_public: int | None = Field(None, description='是否公开')
