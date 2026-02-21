from app.mcp.model import McpCategory, McpServer
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy_crud_plus import CRUDPlus


class CRUDMcpCategory(CRUDPlus[McpCategory]):
    async def get_recommend_category(self):
        """
        get recommend category's mcp category
        Returns:

        """
        stmt = (
            select(self.model)
            .where(self.model.is_recommend.is_(True))
            .options(
                selectinload(self.model.mcp_servers).selectinload(McpServer.user),  # 加载 servers.user
                selectinload(self.model.mcp_servers).noload(McpServer.category),  # 不加载 servers.category
            )
        )
        return stmt

    async def get_all_categories(self):
        """获取所有分类"""
        stmt = select(self.model).order_by(self.model.id)
        return stmt


mcp_category_dao = CRUDMcpCategory(McpCategory)
