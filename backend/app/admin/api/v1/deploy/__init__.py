from app.admin.api.v1.deploy.log import router as deploy_log_router
from fastapi import APIRouter

router = APIRouter(prefix='/deploy', tags=['部署管理'])
router.include_router(deploy_log_router)
