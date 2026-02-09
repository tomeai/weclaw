from app.skills.api.v1.server.skill import router as server_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH + '/skill')
v1.include_router(server_router)
