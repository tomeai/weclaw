from typing import Any

import bcrypt

from app.admin.model import (
    DataRule,
    DataScope,
    Menu,
    Role,
    User,
    data_scope_rule,
    role_data_scope,
    role_menu,
    user_role,
)
from app.admin.schema.user import (
    AddOAuth2UserParam,
    AddUserParam,
    AddUserRoleParam,
    UpdateUserParam,
)
from sqlalchemy import Select, delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus
from utils.dynamic_import import import_module_cached
from utils.password_security import get_hash_password
from utils.serializers import select_join_serialize
from utils.timezone import timezone


class CRUDUser(CRUDPlus[User]):
    """用户数据库操作类"""

    async def get(self, db: AsyncSession, user_id: int) -> User | None:
        """
        获取用户详情

        :param db: 数据库会话
        :param user_id: 用户 ID
        :return:
        """
        return await self.select_model(db, user_id)

    async def get_by_username(self, db: AsyncSession, username: str) -> User | None:
        """
        通过用户名获取用户

        :param db: 数据库会话
        :param username: 用户名
        :return:
        """
        return await self.select_model_by_column(db, username=username)

    async def get_by_nickname(self, db: AsyncSession, nickname: str) -> User | None:
        """
        通过昵称获取用户

        :param db: 数据库会话
        :param nickname: 用户昵称
        :return:
        """
        return await self.select_model_by_column(db, nickname=nickname)

    async def check_email(self, db: AsyncSession, email: str) -> User | None:
        """
        检查邮箱是否已被绑定

        :param db: 数据库会话
        :param email: 电子邮箱
        :return:
        """
        return await self.select_model_by_column(db, email=email)

    async def get_select(self, username: str | None, phone: str | None, status: int | None) -> Select:
        """
        获取用户列表查询表达式

        :param username: 用户名
        :param phone: 电话号码
        :param status: 用户状态
        :return:
        """
        filters = {}

        if username:
            filters['username__like'] = f'%{username}%'
        if phone:
            filters['phone__like'] = f'%{phone}%'
        if status is not None:
            filters['status'] = status

        return await self.select_order('id', 'desc', **filters)

    async def add(self, db: AsyncSession, obj: AddUserParam) -> None:
        """
        添加用户

        :param db: 数据库会话
        :param obj: 添加用户参数
        :return:
        """
        salt = bcrypt.gensalt()
        obj.password = get_hash_password(obj.password, salt)

        dict_obj = obj.model_dump(exclude={'roles'})
        dict_obj.update({'salt': salt})
        new_user = self.model(**dict_obj)
        db.add(new_user)
        await db.flush()

        if obj.roles:
            role_stmt = select(Role).where(Role.id.in_(obj.roles))
            result = await db.execute(role_stmt)
            roles = result.scalars().all()

            user_role_data = [AddUserRoleParam(user_id=new_user.id, role_id=role.id).model_dump() for role in roles]
            user_role_stmt = insert(user_role)
            await db.execute(user_role_stmt, user_role_data)

    async def add_by_oauth2(self, db: AsyncSession, obj: AddOAuth2UserParam) -> None:
        """
        通过 OAuth2 添加用户

        :param db: 数据库会话
        :param obj: 注册用户参数
        :return:
        """
        dict_obj = obj.model_dump()
        dict_obj.update({'is_staff': True, 'salt': None})
        new_user = self.model(**dict_obj)
        db.add(new_user)
        await db.flush()

        role_stmt = select(Role)
        result = await db.execute(role_stmt)
        role = result.scalars().first()  # 默认绑定第一个角色

        user_role_stmt = insert(user_role).values(AddUserRoleParam(user_id=new_user.id, role_id=role.id).model_dump())
        await db.execute(user_role_stmt)

    async def update(self, db: AsyncSession, user_id: int, obj: UpdateUserParam) -> int:
        """
        更新用户信息

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param obj: 更新用户参数
        :return:
        """
        role_ids = obj.roles
        del obj.roles

        count = await self.update_model(db, user_id, obj)

        user_role_stmt = delete(user_role).where(user_role.c.user_id == user_id)
        await db.execute(user_role_stmt)

        if role_ids:
            role_stmt = select(Role).where(Role.id.in_(role_ids))
            result = await db.execute(role_stmt)
            roles = result.scalars().all()

            user_role_data = [AddUserRoleParam(user_id=user_id, role_id=role.id).model_dump() for role in roles]
            user_role_stmt = insert(user_role)
            await db.execute(user_role_stmt, user_role_data)

        return count

    async def update_login_time(self, db: AsyncSession, username: str) -> int:
        """
        更新用户上次登录时间

        :param db: 数据库会话
        :param username: 用户名
        :return:
        """
        return await self.update_model_by_column(db, {'last_login_time': timezone.now()}, username=username)

    async def update_password_changed_time(self, db: AsyncSession, user_id: int) -> int:
        """
        更新用户上次密码变更时间

        :param db: 数据库会话
        :param user_id: 用户 ID
        :return:
        """
        return await self.update_model(db, user_id, {'last_password_changed_time': timezone.now()})

    async def update_nickname(self, db: AsyncSession, user_id: int, nickname: str) -> int:
        """
        更新用户昵称

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param nickname: 用户昵称
        :return:
        """
        return await self.update_model(db, user_id, {'nickname': nickname})

    async def update_avatar(self, db: AsyncSession, user_id: int, avatar: str) -> int:
        """
        更新用户头像

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param avatar: 头像地址
        :return:
        """
        return await self.update_model(db, user_id, {'avatar': avatar})

    async def update_email(self, db: AsyncSession, user_id: int, email: str) -> int:
        """
        更新用户邮箱

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param email: 邮箱
        :return:
        """
        return await self.update_model(db, user_id, {'email': email})

    async def reset_password(self, db: AsyncSession, pk: int, password: str) -> int:
        """
        重置用户密码

        :param db: 数据库会话
        :param pk: 用户 ID
        :param password: 新密码
        :return:
        """
        salt = bcrypt.gensalt()
        new_pwd = get_hash_password(password, salt)
        return await self.update_model(db, pk, {'password': new_pwd, 'salt': salt}, flush=True)

    async def set_super(self, db: AsyncSession, user_id: int, *, is_super: bool) -> int:
        """
        设置用户超级管理员状态

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param is_super: 是否超级管理员
        :return:
        """
        return await self.update_model(db, user_id, {'is_superuser': is_super})

    async def set_staff(self, db: AsyncSession, user_id: int, *, is_staff: bool) -> int:
        """
        设置用户后台登录状态

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param is_staff: 是否可登录后台
        :return:
        """
        return await self.update_model(db, user_id, {'is_staff': is_staff})

    async def set_status(self, db: AsyncSession, user_id: int, status: int) -> int:
        """
        设置用户状态

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param status: 状态
        :return:
        """
        return await self.update_model(db, user_id, {'status': status})

    async def set_multi_login(self, db: AsyncSession, user_id: int, *, multi_login: bool) -> int:
        """
        设置用户多端登录状态

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param multi_login: 是否允许多端登录
        :return:
        """
        return await self.update_model(db, user_id, {'is_multi_login': multi_login})

    async def delete(self, db: AsyncSession, user_id: int) -> int:
        """
        删除用户

        :param db: 数据库会话
        :param user_id: 用户 ID
        :return:
        """
        user_role_stmt = delete(user_role).where(user_role.c.user_id == user_id)
        await db.execute(user_role_stmt)

        try:
            user_social = import_module_cached('backend.plugin.oauth2.crud.crud_user_social')
            user_social_dao = user_social.user_social_dao
        except (ImportError, AttributeError):
            pass
        else:
            await user_social_dao.delete_by_user_id(db, user_id)

        return await self.delete_model(db, user_id)

    async def get_join(
        self,
        db: AsyncSession,
        *,
        user_id: int | None = None,
        username: str | None = None,
    ) -> Any | None:
        """
        获取用户关联信息

        :param db: 数据库会话
        :param user_id: 用户 ID
        :param username: 用户名
        :return:
        """
        filters = []

        if user_id:
            filters.append(User.id == user_id)
        if username:
            filters.append(User.username == username)

        stmt = (
            select(User, Role, Menu, DataScope, DataRule)
            .outerjoin(user_role, user_role.c.user_id == User.id)
            .outerjoin(Role, Role.id == user_role.c.role_id)
            .outerjoin(role_menu, role_menu.c.role_id == Role.id)
            .outerjoin(Menu, Menu.id == role_menu.c.menu_id)
            .outerjoin(role_data_scope, role_data_scope.c.role_id == Role.id)
            .outerjoin(DataScope, DataScope.id == role_data_scope.c.data_scope_id)
            .outerjoin(data_scope_rule, data_scope_rule.c.data_scope_id == DataScope.id)
            .outerjoin(DataRule, DataRule.id == data_scope_rule.c.data_rule_id)
        )
        if filters:
            stmt = stmt.where(*filters)

        result = await db.execute(stmt)
        rows = result.all()

        return select_join_serialize(
            rows,
            relationships=[
                'User-m2m-Role',
                'Role-m2m-Menu',
                'Role-m2m-DataScope:scopes',
                'DataScope-m2m-DataRule:rules',
            ],
        )


user_dao: CRUDUser = CRUDUser(User)
