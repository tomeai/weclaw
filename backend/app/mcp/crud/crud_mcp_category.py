from app.mcp.model import McpCategory
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDMcpCategory(CRUDPlus[McpCategory]):
    async def get_mcp_category(self, db: AsyncSession, pk: int) -> McpCategory:
        return await self.select_model(db, pk)

    async def get_recommend_category(self):
        """
        get recommend category's mcp category
        Returns:

        """
        stmt = (
            select(self.model)
            .where(self.model.is_recommend.is_(True))
            .options(
                # 预加载 servers，避免 N+1 查询
                selectinload(self.model.servers)
            )
        )
        return stmt


mcp_category_dao = CRUDMcpCategory(McpCategory)
