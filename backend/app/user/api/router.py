from app.user.api.v1.auth import router as auth_router
from app.user.api.v1.oauth import router as oauth_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH)

v1.include_router(auth_router)
v1.include_router(oauth_router)
