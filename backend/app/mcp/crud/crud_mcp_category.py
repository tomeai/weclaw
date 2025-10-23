from app.admin.model import McpCategory, McpServer
from sqlalchemy import select
from sqlalchemy.orm import noload, selectinload
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
                selectinload(self.model.servers),  # 加载 servers
                noload(self.model.servers, McpServer.category),  # 从 root 到 category 的完整路径
                noload(self.model.servers, McpServer.user),  # 从 root 到 user 的完整路径
            )
        )
        return stmt


mcp_category_dao = CRUDMcpCategory(McpCategory)
