from collections.abc import Sequence

from app.admin.model import role_menu, user_role
from core.conf import settings
from database.redis import redis_client
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class UserCacheManager:
    """用户缓存管理"""

    @staticmethod
    async def clear(user_ids: Sequence[int]) -> None:
        """
        清理用户缓存

        :param user_ids: 用户 ID 列表
        :return:
        """
        if user_ids:
            await redis_client.delete(*[f'{settings.JWT_USER_REDIS_PREFIX}:{user_id}' for user_id in user_ids])

    async def clear_by_role_id(self, db: AsyncSession, role_ids: list[int]) -> None:
        """
        通过角色 ID 清理用户缓存

        :param db: 数据库会话
        :param role_ids: 角色 ID 列表
        :return:
        """
        stmt = select(user_role.c.user_id).where(user_role.c.role_id.in_(role_ids)).distinct()
        result = await db.execute(stmt)
        user_ids = result.scalars().all()

        await self.clear(user_ids)

    async def clear_by_menu_id(self, db: AsyncSession, menu_ids: list[int]) -> None:
        """
        通过菜单 ID 清理用户缓存

        :param db: 数据库会话
        :param menu_ids: 菜单 ID 列表
        :return:
        """
        stmt = (
            select(user_role.c.user_id)
            .join(role_menu, user_role.c.role_id == role_menu.c.role_id)
            .where(role_menu.c.menu_id.in_(menu_ids))
            .distinct()
        )
        result = await db.execute(stmt)
        user_ids = result.scalars().all()

        await self.clear(user_ids)


user_cache_manager: UserCacheManager = UserCacheManager()
