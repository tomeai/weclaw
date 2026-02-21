from app.admin.api.v1.agent.category import router as agent_category_router
from app.admin.api.v1.agent.server import router as agent_server_router
from fastapi import APIRouter

router = APIRouter(prefix='/agent')

router.include_router(agent_server_router, prefix='/servers', tags=['admin agent server'])
router.include_router(agent_category_router, prefix='/categories', tags=['admin agent category'])
