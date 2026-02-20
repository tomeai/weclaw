from app.admin.api.v1.sys import role, user
from fastapi import APIRouter

router = APIRouter(prefix='/sys')
router.include_router(user.router, prefix='/users', tags=['用户管理'])
router.include_router(role.router, prefix='/roles', tags=['角色管理'])
