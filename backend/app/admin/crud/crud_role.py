from collections.abc import Sequence
from typing import Any

from app.admin.model import DataScope, Menu, Role, role_data_scope, role_menu
from app.admin.schema.role import (
    CreateRoleMenuParam,
    CreateRoleParam,
    CreateRoleScopeParam,
    UpdateRoleMenuParam,
    UpdateRoleParam,
    UpdateRoleScopeParam,
)
from sqlalchemy import Select, delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus
from utils.serializers import select_join_serialize


class CRUDRole(CRUDPlus[Role]):
    """角色数据库操作类"""

    async def get(self, db: AsyncSession, role_id: int) -> Role | None:
        """
        获取角色详情

        :param db: 数据库会话
        :param role_id: 角色 ID
        :return:
        """
        return await self.select_model(db, role_id)

    async def get_join(self, db: AsyncSession, pk: int) -> Any | None:
        """
        获取角色及关联菜单、数据范围

        :param db: 数据库会话
        :param pk: 角色 ID
        :return:
        """
        stmt = (
            select(Role, Menu, DataScope)
            .outerjoin(role_menu, role_menu.c.role_id == Role.id)
            .outerjoin(Menu, Menu.id == role_menu.c.menu_id)
            .outerjoin(role_data_scope, role_data_scope.c.role_id == Role.id)
            .outerjoin(DataScope, DataScope.id == role_data_scope.c.data_scope_id)
            .where(Role.id == pk)
        )
        result = await db.execute(stmt)
        rows = result.all()

        return select_join_serialize(
            rows,
            relationships=[
                'Role-m2m-Menu:menus',
                'Role-m2m-DataScope:scopes',
            ],
        )

    async def get_menus(self, db: AsyncSession, role_id: int) -> Sequence[Menu]:
        """
        获取角色关联的所有菜单

        :param db: 数据库会话
        :param role_id: 角色 ID
        :return:
        """
        stmt = select(Menu).join(role_menu, role_menu.c.menu_id == Menu.id).where(role_menu.c.role_id == role_id)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_all(self, db: AsyncSession) -> Sequence[Role]:
        """
        获取所有角色

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def get_select(self, name: str | None, status: int | None) -> Select:
        """
        获取角色列表查询表达式

        :param name: 角色名称
        :param status: 角色状态
        :return:
        """
        filters = {}

        if name is not None:
            filters['name__like'] = f'%{name}%'
        if status is not None:
            filters['status'] = status

        return await self.select_order('id', **filters)

    async def get_by_name(self, db: AsyncSession, name: str) -> Role | None:
        """
        通过名称获取角色

        :param db: 数据库会话
        :param name: 角色名称
        :return:
        """
        return await self.select_model_by_column(db, name=name)

    async def create(self, db: AsyncSession, obj: CreateRoleParam) -> None:
        """
        创建角色

        :param db: 数据库会话
        :param obj: 创建角色参数
        :return:
        """
        await self.create_model(db, obj)

    async def update(self, db: AsyncSession, role_id: int, obj: UpdateRoleParam) -> int:
        """
        更新角色

        :param db: 数据库会话
        :param role_id: 角色 ID
        :param obj: 更新角色参数
        :return:
        """
        return await self.update_model(db, role_id, obj)

    @staticmethod
    async def update_menus(db: AsyncSession, role_id: int, menu_ids: UpdateRoleMenuParam) -> int:
        """
        更新角色菜单

        :param db: 数据库会话
        :param role_id: 角色 ID
        :param menu_ids: 菜单 ID 列表
        :return:
        """
        role_menu_stmt = delete(role_menu).where(role_menu.c.role_id == role_id)
        await db.execute(role_menu_stmt)

        if menu_ids.menus:
            role_menu_data = [
                CreateRoleMenuParam(role_id=role_id, menu_id=menu_id).model_dump() for menu_id in menu_ids.menus
            ]
            role_menu_stmt = insert(role_menu)
            await db.execute(role_menu_stmt, role_menu_data)

        return len(menu_ids.menus)

    @staticmethod
    async def update_scopes(db: AsyncSession, role_id: int, scope_ids: UpdateRoleScopeParam) -> int:
        """
        更新角色数据范围

        :param db: 数据库会话
        :param role_id: 角色 ID
        :param scope_ids: 数据范围 ID 列表
        :return:
        """
        role_data_scope_stmt = delete(role_data_scope).where(role_data_scope.c.role_id == role_id)
        await db.execute(role_data_scope_stmt)

        if scope_ids.scopes:
            role_data_scope_data = [
                CreateRoleScopeParam(role_id=role_id, data_scope_id=scope_id).model_dump()
                for scope_id in scope_ids.scopes
            ]
            role_data_scope_stmt = insert(role_data_scope)
            await db.execute(role_data_scope_stmt, role_data_scope_data)

        return len(scope_ids.scopes)

    async def delete(self, db: AsyncSession, role_ids: list[int]) -> int:
        """
        批量删除角色

        :param db: 数据库会话
        :param role_ids: 角色 ID 列表
        :return:
        """
        return await self.delete_model_by_column(db, allow_multiple=True, id__in=role_ids)


role_dao: CRUDRole = CRUDRole(Role)
