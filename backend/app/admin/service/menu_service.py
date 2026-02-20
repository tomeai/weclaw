from collections.abc import Sequence

from app.admin.crud.crud_menu import menu_dao
from app.admin.model import Menu
from app.admin.schema.menu import CreateMenuParam, GetMenuTree, UpdateMenuParam
from common.exception import errors
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
    async def get_all_flat(*, db: AsyncSession) -> Sequence[Menu]:
        return await menu_dao.get_all(db)

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


menu_service: MenuService = MenuService()
