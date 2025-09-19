from app.mcp.api.v1.serverless.deploy import router as serverless_router
from app.mcp.api.v1.serverless.invoke import router as invoker_router
from fastapi import APIRouter

router = APIRouter(prefix='/serverless')

router.include_router(serverless_router, prefix='/deploy', tags=['serverless deploy'])
router.include_router(invoker_router, prefix='/invoke', tags=['serverless invoke'])
