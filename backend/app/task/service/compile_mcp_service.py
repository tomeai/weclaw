from app.admin.model import McpServer
from app.admin.model.mcp import CompileType, RuntimeType, ServerType, TransportType
from app.mcp.crud.crud_mcp_server import mcp_server_dao
from app.mcp.schema.mcp import AddMcpServerParam
from app.user.crud.crud_user import user_dao
from core.conf import settings
from database.db import async_db_session
from fastmcp import Client
from fastmcp.mcp_config import MCPConfig
from github import Auth, Github
from loguru import logger


class CompileMcpService:
    def __init__(self):
        self.github = Github(auth=Auth.Token(settings.GITHUB_ACCESS_TOKEN), timeout=10)

    async def compile_mcp_by_mcp_config(self, mcp_user: str, obj_data: dict):
        try:
            mcp_server_param = AddMcpServerParam(**obj_data)

            try:
                repo = mcp_server_param.git.replace('https://github.com/', '')
                repo = self.github.get_repo(repo)
                if not mcp_server_param.description:
                    mcp_server_param.description = repo.description

                if not mcp_server_param.readme:
                    mcp_server_param.readme = repo.get_readme().decoded_content.decode()

                avatar_url = repo.owner.avatar_url
            except Exception as e:
                logger.error(e)
                avatar_url = ''

            mcpServers = mcp_server_param.mcpServers.mcpServers
            mcp_config = MCPConfig(mcpServers=mcpServers)
            mcp_name = list(mcp_config.mcpServers.keys())[0]
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
                        fn_result = (await fetch_fn()).model_dump().get(name)
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
                    runtime_type=RuntimeType.mcp_gateway.name,
                    server_config=mcp_config.model_dump(),
                    envs=mcp_config.mcpServers[mcp_name].env,
                    server_metadata=server_meta.model_dump(),
                    tools=results['tools'],
                    resources=results['resources'],
                    prompts=results['prompts'],
                    git=mcp_server_param.git,
                    description=mcp_server_param.description,
                    readme=mcp_server_param.readme,
                    avatar=avatar_url,
                )
                logger.info('compile mcp_server success')
                async with async_db_session.begin() as db:
                    user = await user_dao.get_by_username(db, mcp_user)
                    mcp_server.user = user
                    await mcp_server_dao.add_mcp(db, mcp_server)
                return 'success'

        except Exception as e:
            logger.exception(f'Failed to compile MCP server for user={mcp_user}, error={e}')
            return None


compile_mcp_service = CompileMcpService()
