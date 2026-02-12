import asyncio
import os

from agentscope.agent import ReActAgent
from agentscope.formatter import DashScopeChatFormatter
from agentscope.memory import InMemoryMemory
from agentscope.message import Msg
from agentscope.model import DashScopeChatModel
from agentscope.pipeline import stream_printing_messages


async def main():
    agent = ReActAgent(
        name='Friday',
        model=DashScopeChatModel(
            'qwen3-max',
            api_key=os.getenv('DASHSCOPE_API_KEY'),
            enable_thinking=True,
            stream=True,
        ),
        sys_prompt="You're a helpful assistant named Friday.",
        # toolkit=toolkit,
        memory=InMemoryMemory(),
        formatter=DashScopeChatFormatter(),
    )

    async for msg, last in stream_printing_messages(
        agents=[agent],
        coroutine_task=agent(Msg('user', '你好', 'user')),
    ):
        print(msg, last)


if __name__ == '__main__':
    asyncio.run(main())
