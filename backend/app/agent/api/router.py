from app.agent.api.v1.runtime.agentscope import router as agentscope_router
from app.agent.api.v1.runtime.chat import router as chat_router
from app.agent.api.v1.runtime.langgraph import router as langgraph_router
from app.agent.api.v1.server.agent import router as server_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH + '/agent')
v1.include_router(agentscope_router)
v1.include_router(chat_router)
v1.include_router(langgraph_router)
v1.include_router(server_router)
