from app.agent.api.v1.agent import router as agent_router
from app.agent.api.v1.thread import router as thread_router
from fastapi import APIRouter

router = APIRouter()
router.include_router(agent_router)
router.include_router(thread_router)
