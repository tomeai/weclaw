import asyncio
import traceback

from collections import defaultdict
from datetime import datetime

from ag_ui.core.events import (
    EventType as AGUIEventType,
)
from ag_ui.core.events import (
    RunErrorEvent,
)
from agentscope.agent import ReActAgent
from agentscope.formatter import DashScopeChatFormatter
from agentscope.mcp import HttpStatefulClient
from agentscope.memory import (
    AsyncSQLAlchemyMemory,
)
from agentscope.message import Msg
from agentscope.model import DashScopeChatModel
from agentscope.pipeline import stream_printing_messages
from agentscope.tool import Toolkit
from agentscope_runtime.engine.deployers.adapter.agui.agui_adapter_utils import AGUIAdapter
from app.agent.model.thread import ChatThread
from app.agent.schema.agent import RunBody
from common.response.response_schema import response_base
from core.conf import settings
from database.sqlite import async_session_marker, get_db
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from utils.agui import msg_to_runtime_events, sse
from utils.openai import call_model

router = APIRouter()

SSE_HEADERS = {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
}


async def generate_title(thread_id: str, query: str):
    """异步调用 AI 生成聊天标题"""
    try:
        title = await call_model(query=query)
        if not title:
            title = '新对话'

        async with async_session_marker() as session:
            thread = await session.get(ChatThread, thread_id)
            if thread:
                thread.chat_title = title
                thread.title_generated = True
                await session.commit()
    except Exception as e:
        logger.error('Failed to generate title for thread %s: %s', thread_id, e)


@router.post('/chat')
async def chat_endpoint(
    chat_req: RunBody,
    db_session: AsyncSession = Depends(get_db),
):
    thread_id = chat_req.threadId
    run_id = chat_req.runId
    first_query = chat_req.messages[-1].content if chat_req.messages else ''

    # 持久化聊天线程元信息
    existing = await db_session.get(ChatThread, thread_id)
    if not existing:
        chat_thread = ChatThread(
            thread_id=thread_id,
            first_query=first_query,
            chat_title='新对话',
            title_generated=False,
            start_time=datetime.now(),
        )
        db_session.add(chat_thread)
        await db_session.flush()
        need_title = True
    else:
        need_title = not existing.title_generated

    # 异步生成标题
    if need_title and first_query:
        asyncio.create_task(generate_title(thread_id, first_query))

    async def event_generator():
        adapter = AGUIAdapter(thread_id=thread_id, run_id=run_id)
        # Track cumulative text length per msg.id to compute delta
        text_sent_len: dict[str, int] = defaultdict(int)

        memory = AsyncSQLAlchemyMemory(
            engine_or_session=db_session,
            user_id='user_1',
            session_id=thread_id,
        )

        map_client = HttpStatefulClient(
            name='mcp_services_stateless',
            transport='streamable_http',
            url='https://mcp.amap.com/mcp?key=16d2c1ab42a4fa07d82faf602af4bcef',
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
                memory=memory,
                formatter=DashScopeChatFormatter(),
                toolkit=toolkit,
            )

            async for msg, last in stream_printing_messages(
                agents=[agent],
                coroutine_task=agent(
                    Msg('user', chat_req.messages[-1].content, 'user'),
                ),
            ):
                # Convert Msg chunk -> runtime Content events
                runtime_events = msg_to_runtime_events(
                    msg,
                    last,
                    text_sent_len,
                )
                # Feed each runtime event through AGUIAdapter
                for rt_event in runtime_events:
                    agui_events = adapter.convert_agent_event_to_agui_events(
                        rt_event,
                    )
                    for agui_event in agui_events:
                        yield sse(agui_event)

            # Ensure RUN_FINISHED
            if not adapter.run_finished_emitted:
                yield sse(
                    adapter.build_run_event(
                        event_type=AGUIEventType.RUN_FINISHED,
                    )
                )

            # 更新 end_time
            async with async_session_marker() as session:
                thread = await session.get(ChatThread, thread_id)
                if thread:
                    thread.end_time = datetime.now()
                    await session.commit()

        except Exception as e:
            logger.error(
                'Error in chat event stream: %s\n%s',
                e,
                traceback.format_exc(),
            )
            error_event = RunErrorEvent(
                message=f'Unexpected stream error: {e}',
                code='internal_error',
            )
            yield sse(error_event)

        finally:
            await map_client.close()

    return StreamingResponse(
        event_generator(),
        media_type='text/event-stream',
        headers=SSE_HEADERS,
    )


@router.get('/threads')
async def list_threads(
    db_session: AsyncSession = Depends(get_db),
):
    """消息摘要列表"""
    result = await db_session.execute(select(ChatThread).order_by(ChatThread.start_time.desc()))
    threads = result.scalars().all()
    return response_base.success(
        data=[
            {
                'thread_id': t.thread_id,
                'chat_title': t.chat_title,
            }
            for t in threads
        ]
    )


@router.get('/threads/{thread_id}/title')
async def get_thread_title(
    thread_id: str,
    db_session: AsyncSession = Depends(get_db),
):
    """获取线程标题（用于前端轮询）"""
    thread = await db_session.get(ChatThread, thread_id)
    if not thread:
        return response_base.success(
            data={
                'thread_id': thread_id,
                'chat_title': '新对话',
                'title_generated': False,
            }
        )
    return response_base.success(
        data={
            'thread_id': thread.thread_id,
            'chat_title': thread.chat_title,
            'title_generated': thread.title_generated,
        }
    )


@router.get('/threads/{thread_id}/messages')
async def get_thread_messages(
    thread_id: str,
    db_session: AsyncSession = Depends(get_db),
):
    async with AsyncSQLAlchemyMemory(
        engine_or_session=db_session,
        user_id='user_1',
        session_id=thread_id,
    ) as memory:
        msgs = await memory.get_memory()

    agui_messages = []
    for msg in msgs:
        d = msg if isinstance(msg, dict) else msg.to_dict()
        role = d.get('role', 'user')
        content = d.get('content', '')
        # Flatten content blocks to plain text if needed
        if isinstance(content, list):
            content = ''.join(b.get('text', '') for b in content if isinstance(b, dict) and b.get('type') == 'text')
        content = str(content).strip()
        # 过滤掉空内容和 system 角色的中间消息（ReAct tool call/result）
        if not content or role == 'system':
            continue
        agui_msg = {
            'id': d.get('id', ''),
            'role': role,
            'content': content,
        }
        agui_messages.append(agui_msg)

    return response_base.success(data=agui_messages)
