from app.mcp.api.v1.server.deploy import router as deploy_router
from app.mcp.api.v1.server.peak import router as peak_router
from app.mcp.api.v1.server.registry import router as registry_router
from fastapi import APIRouter

router = APIRouter(prefix='/server')

router.include_router(peak_router, prefix='/peak', tags=['peak'])
router.include_router(deploy_router, prefix='/deploy', tags=['mcp deploy'])
router.include_router(registry_router, prefix='/registry', tags=['mcp registry'])
