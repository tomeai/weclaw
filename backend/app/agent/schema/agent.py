from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class ChatType(str, Enum):
    auto = 'auto'
    mcp = 'mcp'
    skill = 'skill'
    agent = 'agent'


class ChatRequest(BaseModel):
    type: ChatType
    owner: str
    name: str
    message: str
