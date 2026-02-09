import asyncio
import os

from agentscope.agent import ReActAgent
from agentscope.formatter import DashScopeChatFormatter
from agentscope.mcp import HttpStatefulClient, StdIOStatefulClient
from agentscope.memory import InMemoryMemory
from agentscope.message import Msg
from agentscope.model import DashScopeChatModel
from agentscope.tool import Toolkit

map_client = HttpStatefulClient(
    # 用于标识 MCP 的名称
    name='mcp_services_stateless',
    transport='streamable_http',
    url=f'https://mcp.amap.com/mcp?key={os.environ["GAODE_API_KEY"]}',
)

train_client = StdIOStatefulClient(name='train_client', command='npx', args=['-y', '12306-mcp'])


async def creating_react_agent() -> None:
    """创建一个 ReAct 智能体并运行一个简单任务。"""
    # 准备工具
    toolkit = Toolkit()
    await map_client.connect()
    await train_client.connect()
    # toolkit.register_tool_function(execute_python_code)

    # toolkit.register_agent_skill('skills/canvas-design')
    toolkit.register_agent_skill('skills/docx')

    await toolkit.register_mcp_client(map_client)
    await toolkit.register_mcp_client(train_client)

    jarvis = ReActAgent(
        name='Jarvis',
        sys_prompt='你是一个名为 Jarvis 的助手',
        model=DashScopeChatModel(
            # model_name="qwen3-max",
            # model_name='deepseek-v3.2',
            model_name='glm-4.7',
            api_key=os.environ['DASHSCOPE_API_KEY'],
            stream=True,
            enable_thinking=False,
        ),
        formatter=DashScopeChatFormatter(),
        toolkit=toolkit,
        memory=InMemoryMemory(),
    )

    msg = Msg(
        name='user',
        # content='大望路到北京动物园做地铁怎么走',
        # content='北京到济宁的火车',
        # content='帮我设计一个 opentome 的logo',
        content='帮我用word写一篇500字的关于人工智能的报告',
        role='user',
    )

    await jarvis(msg)

    await train_client.close()
    await map_client.close()


if __name__ == '__main__':
    asyncio.run(creating_react_agent())
