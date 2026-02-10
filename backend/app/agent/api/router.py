from app.agent.api.v1.runtime.invoke import router as invoke_router
from app.agent.api.v1.server.agent import router as server_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH + '/agent')
v1.include_router(invoke_router)
v1.include_router(server_router)
