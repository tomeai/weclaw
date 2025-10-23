from app.admin.api.v1.mcp.category import router as mcp_category_router
from app.admin.api.v1.mcp.server import router as mcp_server_router
from fastapi import APIRouter

router = APIRouter(prefix='/mcp')

router.include_router(mcp_server_router, prefix='/servers', tags=['mcp server'])
router.include_router(mcp_category_router, prefix='/categories', tags=['mcp category'])
