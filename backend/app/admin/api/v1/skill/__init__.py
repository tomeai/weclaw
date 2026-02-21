from app.admin.api.v1.skill.category import router as skill_category_router
from app.admin.api.v1.skill.server import router as skill_server_router
from fastapi import APIRouter

router = APIRouter(prefix='/skill')

router.include_router(skill_server_router, prefix='/servers', tags=['admin skill server'])
router.include_router(skill_category_router, prefix='/categories', tags=['admin skill category'])
