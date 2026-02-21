from app.admin.schema.category import AddCategoryParam
from app.mcp.model import McpCategory
from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDMcpAdminCategory(CRUDPlus[McpCategory]):
    async def get_mcp_category(self, db: AsyncSession, pk: int) -> McpCategory:
        return await self.select_model(db, pk)

    async def get_list(self, is_recommend: int | None = None) -> Select:
        filters = {}
        if is_recommend:
            filters['is_recommend'] = is_recommend
            if is_recommend < 0:
                filters.pop('is_recommend')
        return await self.select_order(
            'updated_time',
            'desc',
            load_options=[noload(self.model.mcp_servers)],
            **filters,
        )

    async def add(self, db: AsyncSession, obj: AddCategoryParam) -> None:
        new_category = self.model(**obj.model_dump())
        db.add(new_category)

    async def get_category_by_name(self, db: AsyncSession, name: str) -> McpCategory:
        """

        Args:
            db:
            name:

        Returns:

        """
        return await self.select_model_by_column(db, name=name)


mcp_admin_category_dao: CRUDMcpAdminCategory = CRUDMcpAdminCategory(McpCategory)
