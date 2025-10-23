import random

from app.admin.crud.crud_user import user_dao
from app.admin.model import User
from app.admin.schema.user import AddUserParam
from common.exception import errors
from database.db import async_db_session
from fastapi import Request


class UserService:
    """用户服务类"""

    @staticmethod
    async def get_userinfo(*, pk: int | None = None, username: str | None = None) -> User:
        """
        获取用户信息

        :param pk: 用户 ID
        :param username: 用户名
        :return:
        """
        async with async_db_session() as db:
            user = await user_dao.get_with_relation(db, user_id=pk, username=username)
            if not user:
                raise errors.NotFoundError(msg='用户不存在')
            return user

    @staticmethod
    async def create(*, request: Request, obj: AddUserParam) -> None:
        """
        创建用户

        :param request: FastAPI 请求对象
        :param obj: 用户添加参数
        :return:
        """
        async with async_db_session.begin() as db:
            if await user_dao.get_by_username(db, obj.username):
                raise errors.ConflictError(msg='用户名已注册')
            obj.nickname = obj.nickname if obj.nickname else f'#{random.randrange(88888, 99999)}'
            if not obj.password:
                raise errors.RequestError(msg='密码不允许为空')
            await user_dao.add(db, obj)


user_service = UserService()
