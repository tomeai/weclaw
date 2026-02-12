import asyncio
import os

import dotenv

from agentscope.agent import ReActAgent, UserAgent
from agentscope.formatter import DashScopeChatFormatter
from agentscope.model import DashScopeChatModel
from agentscope.plan import PlanNotebook

dotenv.load_dotenv()
plan_notebook = PlanNotebook()


async def list_tools() -> None:
    """列出PlanNotebook提供的工具函数。"""
    print('PlanNotebook提供的工具：')
    for tool in plan_notebook.list_tools():
        print(tool.__name__)


agent = ReActAgent(
    name='Friday',
    sys_prompt='你是一个有用的助手。',
    model=DashScopeChatModel(
        model_name='qwen-max',
        api_key=os.environ['DASHSCOPE_API_KEY'],
    ),
    formatter=DashScopeChatFormatter(),
    plan_notebook=plan_notebook,
)


async def interact_with_agent() -> None:
    """与计划智能体交互。"""
    user = UserAgent(name='user')

    msg = None
    while True:
        msg = await user(msg)
        if msg.get_text_content() == 'exit':
            break
        msg = await agent(msg)


if __name__ == '__main__':
    # asyncio.run(list_tools())
    asyncio.run(interact_with_agent())
