import json

from agentscope.agent import ReActAgent
from agentscope.formatter import DashScopeChatFormatter
from agentscope.mcp import HttpStatefulClient
from agentscope.message import Msg
from agentscope.model import DashScopeChatModel
from agentscope.pipeline import stream_printing_messages
from agentscope.tool import Toolkit
from app.agent.schema.agent import ChatAgentParam
from core.conf import settings
from database.db import get_db
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


@router.post('/chat')
async def chat_endpoint(
    chat_msg: ChatAgentParam,
    db_session: AsyncSession = Depends(get_db),
):
    async def event_generator():
        map_client = HttpStatefulClient(
            name='mcp_services_stateless',
            transport='streamable_http',
            url='https://mcp.amap.com/mcp?key=d39c17ed2cde7621672d7fd880fbb560',
        )

        toolkit = Toolkit()

        try:
            await map_client.connect()
            await toolkit.register_mcp_client(map_client)

            agent = ReActAgent(
                name='Jarvis',
                sys_prompt='你是一个名为 Jarvis 的助手',
                model=DashScopeChatModel(
                    model_name='qwen-max',
                    api_key=settings.DASHSCOPE_API_KEY,
                    stream=True,
                    enable_thinking=False,
                ),
                formatter=DashScopeChatFormatter(),
                toolkit=toolkit,
            )

            async for msg, _ in stream_printing_messages(
                agents=[agent],
                coroutine_task=agent(Msg('user', chat_msg.user_msg, 'user')),
            ):
                yield f'data: {json.dumps(msg.to_dict(), ensure_ascii=False)}\n\n'

        finally:
            await map_client.close()

    return StreamingResponse(
        event_generator(),
        media_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    )
