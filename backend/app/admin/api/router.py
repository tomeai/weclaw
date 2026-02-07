from app.admin.api.v1.auth import router as auth_router
from app.admin.api.v1.log import router as log_router
from app.admin.api.v1.mcp import router as mcp_router
from app.admin.api.v1.oauth import router as oauth_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH + '/admin')
v1.include_router(log_router)
v1.include_router(mcp_router)
v1.include_router(auth_router)
v1.include_router(oauth_router)
