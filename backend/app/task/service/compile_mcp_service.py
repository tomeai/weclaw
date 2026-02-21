from app.admin.crud.crud_user import user_dao
from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.model import McpServer
from app.mcp.schema.enums import CompileType, RuntimeType, ServerType, TransportType
from app.mcp.schema.mcp import AddMcpServerParam
from database.db import async_db_session
from fastmcp import Client
from fastmcp.mcp_config import MCPConfig
from loguru import logger


class CompileMcpService:
    @staticmethod
    async def compile_mcp_by_mcp_config(mcp_user: str, obj_data: dict):
        mcp_server_param = AddMcpServerParam(**obj_data)
        mcp_servers = mcp_server_param.mcpServers.mcpServers
        mcp_config = MCPConfig(mcpServers=mcp_servers)
        # 和serverInfo.name不一定一样
        mcp_name = list(mcp_config.mcpServers.keys())[0]
        server_cfg = mcp_config.mcpServers[mcp_name]
        mcp_envs = server_cfg.env

        for key, value in mcp_envs.items():
            mcp_envs[key] = key.upper()

        async with Client(mcp_config) as client:
            await client.ping()
            server_meta = client.initialize_result

            capability_map = {
                'tools': client.list_tools_mcp,
                'resources': client.list_resources_mcp,
                'prompts': client.list_prompts_mcp,
            }

            results = {}
            for name, fetch_fn in capability_map.items():
                enabled = getattr(server_meta.capabilities, name, False)
                if not enabled:
                    results[name] = None
                    continue
                try:
                    fn_result = (await fetch_fn()).model_dump(mode='json').get(name)
                    if fn_result:
                        results[name] = fn_result
                    else:
                        results[name] = None
                except Exception as e:
                    logger.warning(f'Fetch {name} failed: {e}')
                    results[name] = None

            mcp_server = McpServer(
                server_title=mcp_server_param.server_title,
                server_name=mcp_name,
                transport=TransportType.stdio.name,
                server_type=ServerType.hosted.name,
                compile_type=CompileType.package.name,
                runtime_type=RuntimeType.fastmcp.name,
                server_config=mcp_config.model_dump(mode='json'),
                envs=server_cfg.env,
                server_metadata=server_meta.model_dump(mode='json'),
                tools=results['tools'],
                resources=results['resources'],
                prompts=results['prompts'],
                description=mcp_server_param.description,
                avatar=f'https://api.dicebear.com/9.x/bottts/svg?seed={server_meta.serverInfo.name}',
            )
            logger.info('compile mcp_server success')
            async with async_db_session.begin() as db:
                user = await user_dao.get_by_username(db, mcp_user)
                if user:
                    mcp_server.user_id = user.id
                await mcp_server_dao.add_mcp(db, mcp_server)
            return 'success'


compile_mcp_service = CompileMcpService()
