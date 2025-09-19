from app.mcp.api.v1.server.server import router as server_router
from fastapi import APIRouter

router = APIRouter(prefix='/mcp')

router.include_router(server_router, prefix='/server', tags=['mcp search'])
