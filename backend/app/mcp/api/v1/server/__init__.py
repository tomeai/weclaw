from fastapi import APIRouter

from app.mcp.api.v1.server.deploy import router as deploy_router
from app.mcp.api.v1.server.invoke import router as invoker_router
from app.mcp.api.v1.server.rank import router as rank_router
from app.mcp.api.v1.server.registry import router as registry_router

router = APIRouter(prefix='/mcp')

router.include_router(rank_router, prefix='/rank', tags=['mcp rank'])
router.include_router(invoker_router, prefix='/invoke', tags=['mcp invoke'])
router.include_router(deploy_router, prefix='/deploy', tags=['mcp deploy'])
router.include_router(registry_router, prefix='/registry', tags=['mcp registry'])
