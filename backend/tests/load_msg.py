import asyncio

from agentscope.memory import (
    AsyncSQLAlchemyMemory,
)
from sqlalchemy.ext.asyncio import create_async_engine


async def sqlalchemy_context_example() -> None:
    """使用 AsyncSQLAlchemyMemory 作为异步上下文管理器的示例。"""
    engine = create_async_engine('sqlite+aiosqlite:///./chat_memory.db')
    async with AsyncSQLAlchemyMemory(
        engine_or_session=engine,
        user_id='user_1',
        session_id='13c84e06-55ee-4ad8-9c70-7221d88ab964',
    ) as memory:
        msgs = await memory.get_memory()
        print('记忆中的所有消息：')
        for msg in msgs:
            print(f'- {msg}')


if __name__ == '__main__':
    asyncio.run(sqlalchemy_context_example())
