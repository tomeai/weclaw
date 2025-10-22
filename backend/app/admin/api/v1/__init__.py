from app.admin.api.v1.category import router as category_router
from app.admin.api.v1.mcp import router as mcp_server_router
from fastapi import APIRouter

router = APIRouter(prefix='/admin')

router.include_router(mcp_server_router, prefix='/mcp', tags=['mcp server router'])
router.include_router(category_router, prefix='/category', tags=['mcp category router'])
