from fastmcp import Client
from fastmcp.mcp_config import MCPConfig
from loguru import logger

from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.model import McpServer
from app.mcp.model.mcp import TransportTypeEnum, CompileTypeEnum, ServerTypeEnum
from app.mcp.schema.mcp import AddMcpServerParam
from app.user.crud.crud_user import user_dao
from database.db import async_db_session


class CompileMcpService:
    @staticmethod
    async def compile_mcp_by_mcp_config(mcp_user: str, obj_data: dict):
        try:
            mcp_server_param = AddMcpServerParam(**obj_data)
            mcp_config = MCPConfig(mcpServers=mcp_server_param.mcpServers)
            mcp_name = list(mcp_config.mcpServers.keys())[0]
            async with Client(mcp_config) as client:
                await client.ping()
                server_meta = client.initialize_result

                capability_map = {
                    "tools": client.list_tools_mcp,
                    "resources": client.list_resources_mcp,
                    "prompts": client.list_prompts_mcp,
                }

                results = {}
                for name, fetch_fn in capability_map.items():
                    enabled = getattr(server_meta.capabilities, name, False)
                    if not enabled:
                        results[name] = None
                        continue
                    try:
                        results[name] = (await fetch_fn()).model_dump()
                    except Exception as e:
                        logger.warning(f"Fetch {name} failed: {e}")
                        results[name] = None

                mcp_server = McpServer(
                    title=mcp_name,
                    transport=TransportTypeEnum.stdio.name,
                    server_type=ServerTypeEnum.hosted.name,
                    compile_type=CompileTypeEnum.package.name,
                    deploy_method=mcp_server_param.deploy_method,
                    server_config=mcp_config.model_dump(),
                    envs=mcp_config.mcpServers[mcp_name].env,
                    server_meta=server_meta.model_dump(),
                    tools=results["tools"],
                    resources=results["resources"],
                    prompts=results["prompts"],

                    git=mcp_server_param.git,
                    description=mcp_server_param.description,

                )
                logger.info(f'compile mcp_server success: {mcp_server}')
                async with async_db_session.begin() as db:
                    user = await user_dao.get_by_username(db, mcp_user)
                    mcp_server.user = user
                    await mcp_server_dao.add_mcp(db, mcp_server)
                return 'success'

        except Exception as e:
            logger.exception(f"Failed to compile MCP server for user={mcp_user}, server={mcp_server}, error={e}")
            return None


compile_mcp_service = CompileMcpService()
