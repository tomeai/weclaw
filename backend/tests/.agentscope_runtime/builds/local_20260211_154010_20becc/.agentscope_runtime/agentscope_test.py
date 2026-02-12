# agent_app.py - 所有的部署方式共享
# -*- coding: utf-8 -*-
import asyncio
import os
import time

from agentscope.agent import ReActAgent
from agentscope.formatter import DashScopeChatFormatter
from agentscope.mcp import HttpStatelessClient
from agentscope.memory import InMemoryMemory
from agentscope.model import DashScopeChatModel
from agentscope.pipeline import stream_printing_messages
from agentscope.session import RedisSession
from agentscope.tool import Toolkit, execute_python_code
from agentscope_runtime.engine.app import AgentApp
from agentscope_runtime.engine.deployers.local_deployer import LocalDeployManager
from agentscope_runtime.engine.deployers.utils.deployment_modes import DeploymentMode
from agentscope_runtime.engine.schemas.agent_schemas import AgentRequest

app = AgentApp(
    app_name='Friday',
    app_description='A helpful assistant',
)


@app.init
async def init_func(self):
    import fakeredis

    fake_redis = fakeredis.aioredis.FakeRedis(decode_responses=True)
    # 注意：这个 FakeRedis 实例仅用于开发/测试。
    # 在生产环境中，请替换为你自己的 Redis 客户端/连接
    # （例如 aioredis.Redis）。
    self.session = RedisSession(connection_pool=fake_redis.connection_pool)


@app.query(framework='agentscope')
async def query_func(
    self,
    msgs,
    request: AgentRequest = None,
    **kwargs,
):
    assert kwargs is not None, 'kwargs is Required for query_func'
    session_id = request.session_id
    user_id = request.user_id
    map_client = HttpStatelessClient(
        name='mcp_services_stateless',
        transport='streamable_http',
        url='https://mcp.amap.com/mcp?key=1ec31da021b2702787841ea4ee822de3',
    )

    toolkit = Toolkit()
    toolkit.register_tool_function(execute_python_code)
    await toolkit.register_mcp_client(map_client)
    agent = ReActAgent(
        name='Friday',
        model=DashScopeChatModel(
            'qwen3-max',
            api_key=os.getenv('DASHSCOPE_API_KEY'),
            enable_thinking=True,
            stream=True,
        ),
        sys_prompt="You're a helpful assistant named Friday.",
        toolkit=toolkit,
        memory=InMemoryMemory(),
        formatter=DashScopeChatFormatter(),
    )

    await self.session.load_session_state(
        session_id=session_id,
        user_id=user_id,
        agent=agent,
    )

    async for msg, last in stream_printing_messages(
        agents=[agent],
        coroutine_task=agent(msgs),
    ):
        yield msg, last

    await self.session.save_session_state(
        session_id=session_id,
        user_id=user_id,
        agent=agent,
    )


# 2. 创建带有多个端点的 AgentApp
@app.endpoint('/sync')
def sync_handler(request: AgentRequest):
    return {'status': 'ok', 'payload': request}


@app.endpoint('/async')
async def async_handler(request: AgentRequest):
    return {'status': 'ok', 'payload': request}


@app.endpoint('/stream_async')
async def stream_async_handler(request: AgentRequest):
    for i in range(5):
        yield f'async chunk {i}, with request payload {request}\n'


@app.endpoint('/stream_sync')
def stream_sync_handler(request: AgentRequest):
    for i in range(5):
        yield f'sync chunk {i}, with request payload {request}\n'


@app.task('/task', queue='celery1')
def task_handler(request: AgentRequest):
    time.sleep(30)
    return {'status': 'ok', 'payload': request}


@app.task('/atask')
async def atask_handler(request: AgentRequest):
    import asyncio

    await asyncio.sleep(15)
    return {'status': 'ok', 'payload': request}


async def main():
    """以独立进程模式部署应用"""
    print('🚀 以独立进程模式部署 AgentApp...')

    # 以独立模式部署
    deployment_info = await app.deploy(
        LocalDeployManager(host='127.0.0.1', port=9000),
        mode=DeploymentMode.DETACHED_PROCESS,
    )

    print(f'✅ 部署成功：{deployment_info["url"]}')
    print(f'📍 部署ID：{deployment_info["deploy_id"]}')
    print(f"""
🎯 服务已启动，测试命令：
curl {deployment_info['url']}/health
curl -X POST {deployment_info['url']}/admin/shutdown  # 停止服务

⚠️ 注意：服务在独立进程中运行，直到被停止。
""")
    return deployment_info


if __name__ == '__main__':
    asyncio.run(main())
