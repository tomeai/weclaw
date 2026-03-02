from collections.abc import Sequence

from app.admin.crud.crud_menu import menu_dao
from app.admin.model import Menu
from app.admin.schema.menu import CreateMenuParam, GetMenuDetail, GetMenuTree, UpdateMenuParam
from common.exception import errors
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession


def _build_tree(menus: Sequence[Menu]) -> list[GetMenuTree]:
    """将平铺菜单列表转换为树形结构"""
    menu_map: dict[int, GetMenuTree] = {}
    roots: list[GetMenuTree] = []

    for menu in menus:
        node = GetMenuTree.model_validate(menu, from_attributes=True)
        node.children = []
        menu_map[menu.id] = node

    for menu in menus:
        node = menu_map[menu.id]
        if menu.parent_id and menu.parent_id in menu_map:
            parent = menu_map[menu.parent_id]
            if parent.children is None:
                parent.children = []
            parent.children.append(node)
        else:
            roots.append(node)

    return roots


class MenuService:
    """菜单服务类"""

    @staticmethod
    async def get_all(*, db: AsyncSession) -> list[GetMenuTree]:
        menus = await menu_dao.get_all(db)
        return _build_tree(menus)

    @staticmethod
    async def get_all_flat(*, db: AsyncSession, types: list[int] | None = None) -> Sequence[Menu]:
        return await menu_dao.get_all(db, types=types)

    @staticmethod
    async def get(*, db: AsyncSession, pk: int) -> Menu:
        menu = await menu_dao.get(db, pk)
        if not menu:
            raise errors.NotFoundError(msg='菜单不存在')
        return menu

    @staticmethod
    async def create(*, db: AsyncSession, obj: CreateMenuParam) -> None:
        if obj.parent_id:
            parent = await menu_dao.get(db, obj.parent_id)
            if not parent:
                raise errors.NotFoundError(msg='父级菜单不存在')
        await menu_dao.create(db, obj)

    @staticmethod
    async def update(*, db: AsyncSession, pk: int, obj: UpdateMenuParam) -> int:
        menu = await menu_dao.get(db, pk)
        if not menu:
            raise errors.NotFoundError(msg='菜单不存在')
        if obj.parent_id and obj.parent_id == pk:
            raise errors.RequestError(msg='不能将自身设为父级菜单')
        return await menu_dao.update(db, pk, obj)

    @staticmethod
    async def delete(*, db: AsyncSession, pk: int) -> int:
        menu = await menu_dao.get(db, pk)
        if not menu:
            raise errors.NotFoundError(msg='菜单不存在')
        return await menu_dao.delete(db, pk)

    @staticmethod
    async def get_user_menus(*, db: AsyncSession, request: Request) -> list[GetMenuDetail]:
        """
        获取当前用户可访问的侧边栏菜单（type=0 目录）
        超级管理员返回全部启用的 type=0 菜单；
        普通用户从其角色关联菜单中筛选 type=0 且启用的菜单
        """
        if request.user.is_superuser:
            menus = await menu_dao.get_all(db, types=[0])
            return [GetMenuDetail.model_validate(m, from_attributes=True) for m in menus]

        seen_ids: set[int] = set()
        result: list[GetMenuDetail] = []
        for role in request.user.roles:
            if role.status != 1:
                continue
            for menu in role.menus:
                if menu and menu.id not in seen_ids and menu.type == 0 and menu.status == 1:
                    result.append(menu if isinstance(menu, GetMenuDetail) else GetMenuDetail.model_validate(menu))
                    seen_ids.add(menu.id)

        result.sort(key=lambda m: (m.sort, m.id))
        return result


menu_service: MenuService = MenuService()
