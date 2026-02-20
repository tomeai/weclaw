from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class ToolParameterProperty(BaseModel):
    type: str
    enum: Optional[List[str]] = None
    description: Optional[str] = None


class ToolParameterItem(BaseModel):
    type: str
    properties: Dict[str, ToolParameterProperty] = {}
    required: Optional[List[str]] = None


class ToolParameters(BaseModel):
    type: str
    properties: Dict[str, ToolParameterProperty] = {}
    required: Optional[List[str]] = None
    items: Optional[ToolParameterItem] = None


class Tool(BaseModel):
    name: str
    description: str
    parameters: ToolParameters


class FunctionInfo(BaseModel):
    name: str
    arguments: str


class ToolCall(BaseModel):
    id: str
    type: str = 'function'
    function: FunctionInfo


class Message(BaseModel):
    id: str
    role: Literal['user', 'assistant', 'system', 'tool']
    content: Optional[str] = None
    toolCalls: Optional[List[ToolCall]] = None
    toolCallId: Optional[str] = None


class RunBody(BaseModel):
    threadId: str
    runId: str
    tools: List[Tool]
    messages: List[Message]
    context: List[Any] = Field(default_factory=list)
    forwardedProps: Dict[str, Any] = Field(default_factory=dict)
    state: Dict[str, Any] = Field(default_factory=dict)


class RunParams(BaseModel):
    agentId: str


class AgentRunRequest(BaseModel):
    method: Literal['agent/run']
    params: RunParams
    body: RunBody


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
