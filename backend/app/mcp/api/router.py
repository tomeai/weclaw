from app.mcp.api.v1 import router as server_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH + '/mcp', tags=['mcp操作'])
v1.include_router(server_router)
