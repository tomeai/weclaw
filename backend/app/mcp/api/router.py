from app.mcp.api.v1.server import router as mcp_router
from app.mcp.api.v1.serverless import router as mcp_serverless
from fastapi import APIRouter

v1 = APIRouter()
v1.include_router(mcp_router)
v1.include_router(mcp_serverless)
