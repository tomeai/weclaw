import random

from typing import Any

from app.admin.crud.crud_user import user_dao
from app.admin.model import Role, user_role
from app.admin.schema.user import AddUserParam, ResetPasswordParam, UpdateUserParam
from common.enums import UserPermissionType
from common.exception import errors
from common.pagination import paging_data
from core.conf import settings
from database.redis import redis_client
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from utils.password_security import password_verify


class UserService:
    """用户服务类"""

    @staticmethod
    async def get_userinfo(*, db: AsyncSession, pk: int | None = None, username: str | None = None) -> Any:
        """
        获取用户信息（含角色关联）

        :param db: 数据库会话
        :param pk: 用户 ID
        :param username: 用户名
        :return:
        """
        user = await user_dao.get_join(db, user_id=pk, username=username)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        return user

    @staticmethod
    async def get_roles(*, db: AsyncSession, pk: int) -> list[Role]:
        """
        获取用户角色列表

        :param db: 数据库会话
        :param pk: 用户 ID
        :return:
        """
        user = await user_dao.get(db, pk)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        stmt = select(Role).join(user_role, user_role.c.role_id == Role.id).where(user_role.c.user_id == pk)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_list(
        *,
        db: AsyncSession,
        username: str | None,
        phone: str | None,
        status: int | None,
    ) -> dict[str, Any]:
        """
        分页获取用户列表

        :param db: 数据库会话
        :param username: 用户名
        :param phone: 手机号
        :param status: 状态
        :return:
        """
        select_stmt = await user_dao.get_select(username=username, phone=phone, status=status)
        return await paging_data(db, select_stmt)

    @staticmethod
    async def create(*, db: AsyncSession, obj: AddUserParam) -> None:
        """
        创建用户

        :param db: 数据库会话
        :param obj: 用户添加参数
        :return:
        """
        if await user_dao.get_by_username(db, obj.username):
            raise errors.ConflictError(msg='用户名已注册')
        obj.nickname = obj.nickname if obj.nickname else f'#{random.randrange(88888, 99999)}'
        if not obj.password:
            raise errors.RequestError(msg='密码不允许为空')
        await user_dao.add(db, obj)

    @staticmethod
    async def update(*, db: AsyncSession, pk: int, obj: UpdateUserParam) -> int:
        """
        更新用户信息

        :param db: 数据库会话
        :param pk: 用户 ID
        :param obj: 更新参数
        :return:
        """
        user = await user_dao.get(db, pk)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        if user.username != obj.username and await user_dao.get_by_username(db, obj.username):
            raise errors.ConflictError(msg='用户名已存在')
        return await user_dao.update(db, pk, obj)

    @staticmethod
    async def update_permission(*, db: AsyncSession, request: Request, pk: int, type: UserPermissionType) -> int:
        """
        更新用户权限

        :param db: 数据库会话
        :param request: 请求对象
        :param pk: 用户 ID
        :param type: 权限类型
        :return:
        """
        user = await user_dao.get(db, pk)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        if type == UserPermissionType.superuser:
            count = await user_dao.set_super(db, pk, is_super=not user.is_superuser)
        elif type == UserPermissionType.staff:
            count = await user_dao.set_staff(db, pk, is_staff=not user.is_staff)
        elif type == UserPermissionType.status:
            count = await user_dao.set_status(db, pk, status=0 if user.status == 1 else 1)
        elif type == UserPermissionType.multi_login:
            count = await user_dao.set_multi_login(db, pk, multi_login=not user.is_multi_login)
        else:
            raise errors.RequestError(msg='不支持的权限类型')
        return count

    @staticmethod
    async def update_password(*, db: AsyncSession, user_id: int, obj: ResetPasswordParam) -> int:
        """
        更新当前用户密码

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param obj: 重置密码参数
        :return:
        """
        user = await user_dao.get(db, user_id)
        if not user or not user.password:
            raise errors.NotFoundError(msg='用户不存在')
        if not password_verify(obj.old_password, user.password):
            raise errors.RequestError(msg='旧密码错误')
        if obj.new_password != obj.confirm_password:
            raise errors.RequestError(msg='两次密码不一致')
        count = await user_dao.reset_password(db, user_id, obj.new_password)
        await user_dao.update_password_changed_time(db, user_id)
        return count

    @staticmethod
    async def reset_password(*, db: AsyncSession, pk: int, password: str) -> int:
        """
        重置用户密码

        :param db: 数据库会话
        :param pk: 用户 ID
        :param password: 新密码
        :return:
        """
        user = await user_dao.get(db, pk)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        return await user_dao.reset_password(db, pk, password)

    @staticmethod
    async def update_nickname(*, db: AsyncSession, user_id: int, nickname: str) -> int:
        """
        更新用户昵称

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param nickname: 昵称
        :return:
        """
        user = await user_dao.get(db, user_id)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        return await user_dao.update_nickname(db, user_id, nickname)

    @staticmethod
    async def update_avatar(*, db: AsyncSession, user_id: int, avatar: str) -> int:
        """
        更新用户头像

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param avatar: 头像地址
        :return:
        """
        user = await user_dao.get(db, user_id)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        return await user_dao.update_avatar(db, user_id, avatar)

    @staticmethod
    async def update_email(*, db: AsyncSession, user_id: int, captcha: str, email: str) -> int:
        """
        更新用户邮箱

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param captcha: 邮箱验证码
        :param email: 新邮箱
        :return:
        """
        redis_key = f'{settings.EMAIL_CODE_REDIS_PREFIX}:{email}'
        cached_code = await redis_client.get(redis_key)
        if not cached_code:
            raise errors.RequestError(msg='验证码已过期，请重新发送')
        if cached_code != captcha:
            raise errors.RequestError(msg='验证码错误')
        await redis_client.delete(redis_key)

        if await user_dao.check_email(db, email):
            raise errors.ConflictError(msg='邮箱已被绑定')
        return await user_dao.update_email(db, user_id, email)

    @staticmethod
    async def delete(*, db: AsyncSession, pk: int) -> int:
        """
        删除用户

        :param db: 数据库会话
        :param pk: 用户 ID
        :return:
        """
        user = await user_dao.get(db, pk)
        if not user:
            raise errors.NotFoundError(msg='用户不存在')
        return await user_dao.delete(db, pk)


user_service = UserService()
