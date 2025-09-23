from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.model import McpServer
from app.mcp.schema.mcp import AddMcpServerParam
from app.user.crud.crud_user import user_dao
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
    async def get_select(*, keyword: str) -> Select:
        return await mcp_server_dao.get_list(keyword)

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
    async def add_mcp(mcp_title: str, obj: AddMcpServerParam) -> (bool, int):
        # todo: 从cookie获取jwt鉴权信息
        username = 'gage'

        async with async_db_session.begin() as db:
            # user 肯定是存在的
            user = await user_dao.get_by_username(db, username)
            mcp_server_exist = await mcp_server_dao.get_mcp_by_title(db, user, mcp_title)
            if mcp_server_exist:
                # 如果已存在，执行更新操作
                mcp_server_exist.description = obj.description
                mcp_server_exist.git = obj.git
                # 更新其他字段，如果需要的话
                await db.flush()  # 确保更新被提交
                return True, mcp_server_exist.id
            else:
                mcp_server = McpServer(title=mcp_title, description=obj.description, git=obj.git)
                # 关联mcp_server
                mcp_server.user = user
                # 如果不存在，新增 mcp_server
                return False, await mcp_server_dao.add_mcp(db, mcp_server)


mcp_server_service: McpServerService = McpServerService()
