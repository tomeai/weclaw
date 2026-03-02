from app.mcp.api.v1.deploy import router as deploy_router
from app.mcp.api.v1.mcp import router as mcp_router
from fastapi import APIRouter

router = APIRouter()
router.include_router(deploy_router)  # 固定前缀路由优先，避免被 /{username}/{server_name} 误匹配
router.include_router(mcp_router)
