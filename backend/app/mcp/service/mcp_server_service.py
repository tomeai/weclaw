from app.admin.crud.crud_user import user_dao
from app.mcp.crud.crud_mcp_category import mcp_category_dao
from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.model import McpServer
from common.exception import errors
from database.db import async_db_session
from fastmcp.mcp_config import StdioMCPServer
from sqlalchemy import Select


class McpServerService:
    @staticmethod
    def get_base_image(cmd) -> str:
        # bun deno 支持
        base_image = {
            'npx': 'registry.cn-beijing.aliyuncs.com/biyao/public:wemcp-node20-v3',
            'node': 'registry.cn-beijing.aliyuncs.com/biyao/public:wemcp-node20-v3',
            'uvx': 'registry.cn-beijing.aliyuncs.com/biyao/public:wemcp-python3.10-v8',
            'python': 'registry.cn-beijing.aliyuncs.com/biyao/public:wemcp-python3.10-v8',
        }
        return base_image[cmd]

    @staticmethod
    def compile_command(mcp_conf: StdioMCPServer):
        base_command = [
            'mcp-proxy',
            '--sse-port',
            '8080',
            '--sse-host',
            '0.0.0.0',
            '--allow-origin',
            '*',
            '--pass-environment',
            '--',
            mcp_conf.command,
        ]
        base_command.extend(mcp_conf.args)
        return base_command

    @staticmethod
    async def get_select(*, keyword: str, category_id: int) -> Select:
        return await mcp_server_dao.get_list(keyword, category_id)

    @staticmethod
    async def get_mcp_last_7_day():
        async with async_db_session() as db:
            stmt = await mcp_server_dao.get_mcp_last_7_day()
            result = await db.execute(stmt)
            return result.scalars().all()

    @staticmethod
    async def get_mcp(pk: int) -> McpServer:
        async with async_db_session() as db:
            return await mcp_server_dao.get_mcp(db, pk)

    @staticmethod
    async def get_mcp_by_user(username: str, server_name: str) -> McpServer:
        async with async_db_session() as db:
            user = await user_dao.get_by_username(db, username)
            if not user:
                raise errors.NotFoundError(msg='用户不存在')
            return await mcp_server_dao.get_mcp_with_user(db, server_name, user.id)

    @staticmethod
    async def get_recommend_mcp() -> list:
        async with async_db_session() as db:
            stmt = await mcp_server_dao.get_recommend_mcp()
            result = await db.execute(stmt)
            return result.scalars().all()

    @staticmethod
    async def get_categories() -> list:
        async with async_db_session() as db:
            stmt = await mcp_category_dao.get_all_categories()
            result = await db.execute(stmt)
            return result.scalars().all()


mcp_server_service: McpServerService = McpServerService()
