from app.mcp.model import McpCategory, McpServer
from app.mcp.schema.category import AddCategoryParam
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload, selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDMcpCategory(CRUDPlus[McpCategory]):
    async def get_mcp_category(self, db: AsyncSession, pk: int) -> McpCategory:
        return await self.select_model(db, pk)

    async def add(self, db: AsyncSession, obj: AddCategoryParam) -> None:
        new_category = self.model(**obj.model_dump(exclude={'is_recommend'}))
        db.add(new_category)

    async def get_list(self, is_recommend: int | None = None) -> Select:
        filters = {}
        if is_recommend:
            filters['is_recommend'] = is_recommend
            if is_recommend < 0:
                filters.pop('is_recommend')
        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[noload(self.model.servers)],
            **filters,
        )

    async def get_category_by_name(self, db: AsyncSession, name: str) -> McpCategory:
        """

        Args:
            db:
            name:

        Returns:

        """
        return await self.select_model_by_column(db, name=name)

    async def get_recommend_category(self):
        """
        get recommend category's mcp category
        Returns:

        """
        stmt = (
            select(self.model)
            .where(self.model.is_recommend.is_(True))
            .options(
                selectinload(self.model.servers),  # 加载 servers
                noload(self.model.servers, McpServer.category),  # 从 root 到 category 的完整路径
                noload(self.model.servers, McpServer.user),  # 从 root 到 user 的完整路径
            )
        )
        return stmt


mcp_category_dao = CRUDMcpCategory(McpCategory)
