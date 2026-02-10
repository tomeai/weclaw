from __future__ import annotations

from common.schema import SchemaBase
from pydantic import Field


class ChatAgentParam(SchemaBase):
    user_id: str = Field(None, description='user id')
    server_name: str = Field(None, description='server_name')
    user_msg: str = Field(None, description='user msg')
