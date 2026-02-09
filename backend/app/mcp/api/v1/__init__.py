from app.mcp.api.v1.registry.deploy import router as deploy_router
from app.mcp.api.v1.registry.invoke import router as invoke_router
from app.mcp.api.v1.server.feed import router as feed_router
from app.mcp.api.v1.server.mcp import router as mcp_router
from fastapi import APIRouter

router = APIRouter()

router.include_router(invoke_router)
router.include_router(deploy_router)
router.include_router(feed_router)
router.include_router(mcp_router)
