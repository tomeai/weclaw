from common.schema import SchemaBase
from pydantic import Field


class GetUserDetail(SchemaBase):
    """用户认证基础模型"""

    username: str = Field(description='用户名')
    avatar: str = Field(description='用户头像')
