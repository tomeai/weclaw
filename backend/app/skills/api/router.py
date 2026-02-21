from app.skills.api.v1 import router as v1_router
from core.conf import settings
from fastapi import APIRouter

v1 = APIRouter(prefix=settings.FASTAPI_API_V1_PATH + '/skill')
v1.include_router(v1_router)
