from collections.abc import Sequence

from app.admin.model import Menu
from app.admin.schema.menu import CreateMenuParam, UpdateMenuParam
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus


class CRUDMenu(CRUDPlus[Menu]):
    """菜单数据库操作类"""

    async def get(self, db: AsyncSession, menu_id: int) -> Menu | None:
        return await self.select_model(db, menu_id)

    async def get_all(self, db: AsyncSession, types: list[int] | None = None) -> Sequence[Menu]:
        """获取所有菜单，按 sort 排序，可按类型过滤"""
        stmt = select(Menu).order_by(Menu.sort, Menu.id)
        if types is not None:
            stmt = stmt.where(Menu.type.in_(types))
        result = await db.execute(stmt)
        return result.scalars().all()

    async def create(self, db: AsyncSession, obj: CreateMenuParam) -> None:
        await self.create_model(db, obj)

    async def update(self, db: AsyncSession, menu_id: int, obj: UpdateMenuParam) -> int:
        return await self.update_model(db, menu_id, obj)

    async def delete(self, db: AsyncSession, menu_id: int) -> int:
        return await self.delete_model(db, menu_id)


menu_dao: CRUDMenu = CRUDMenu(Menu)
