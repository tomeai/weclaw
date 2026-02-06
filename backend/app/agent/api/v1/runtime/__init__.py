from app.agent.api.v1.runtime.invoke import router as invoker_router
from fastapi import APIRouter

router = APIRouter(prefix='/runtime')

router.include_router(invoker_router, prefix='/invoke', tags=['mcp invoke'])
