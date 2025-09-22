from fastapi import APIRouter

from app.mcp.api.v1.server import router as mcp_router

v1 = APIRouter()
v1.include_router(mcp_router)
