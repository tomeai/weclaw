import json
import traceback

from collections import defaultdict

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
from agentscope_runtime.engine.deployers.adapter.agui.agui_adapter_utils import (
    AGUIAdapter,
)
from agentscope_runtime.engine.schemas.agent_schemas import (
    DataContent,
    FunctionCall,
    FunctionCallOutput,
    RunStatus,
    TextContent,
)
from app.agent.schema.agent import RunBody
from common.response.response_schema import response_base
from core.conf import settings
from database.sqlite import get_db
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

SSE_HEADERS = {
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
}


def _sse(event) -> str:
    """Serialize an ag-ui event to SSE data line."""
    data = event.model_dump(mode='json', exclude_none=True, by_alias=True)
    return f'data: {json.dumps(data, ensure_ascii=False)}\n\n'


def _msg_to_runtime_events(
    msg: Msg,
    last: bool,
    text_sent_len: dict[str, int],
) -> list:
    """Convert an agentscope Msg chunk into a list of runtime Content/Message
    events that AGUIAdapter.convert_agent_event_to_agui_events() can consume.

    For streaming text: compute delta from cumulative content, emit
    TextContent(delta=True) for each incremental chunk, and
    TextContent(delta=False) on the final chunk to signal completion.

    For tool_use/tool_result blocks: emit DataContent with FunctionCall /
    FunctionCallOutput when last=True (agentscope doesn't stream tool args
    incrementally).
    """
    events = []
    msg_id = msg.id

    if msg.has_content_blocks():
        blocks = msg.get_content_blocks()
        for idx, block in enumerate(blocks):
            block_type = block.get('type')

            if block_type == 'tool_use':
                if last:
                    # Emit completed FunctionCall
                    args = block.get('input', {})
                    events.append(
                        DataContent(
                            msg_id=msg_id,
                            index=idx,
                            delta=False,
                            status=RunStatus.Completed,
                            data=FunctionCall(
                                call_id=block['id'],
                                name=block['name'],
                                arguments=json.dumps(args, ensure_ascii=False),
                            ).model_dump(),
                        )
                    )

            elif block_type == 'tool_result':
                if last:
                    output = block.get('output', '')
                    if isinstance(output, list):
                        # Flatten text blocks
                        output = ''.join(
                            b.get('text', '') for b in output if isinstance(b, dict) and b.get('type') == 'text'
                        )
                    events.append(
                        DataContent(
                            msg_id=msg_id,
                            index=idx,
                            delta=False,
                            status=RunStatus.Completed,
                            data=FunctionCallOutput(
                                call_id=block.get('id', ''),
                                output=str(output),
                            ).model_dump(),
                        )
                    )

            elif block_type == 'text':
                full_text = block.get('text', '')
                prev_len = text_sent_len.get(msg_id, 0)
                delta_text = full_text[prev_len:]

                if delta_text:
                    events.append(
                        TextContent(
                            msg_id=msg_id,
                            index=idx,
                            delta=True,
                            text=delta_text,
                        )
                    )
                    text_sent_len[msg_id] = len(full_text)

                if last:
                    # Signal end of text stream
                    events.append(
                        TextContent(
                            msg_id=msg_id,
                            index=idx,
                            delta=False,
                            text=full_text,
                        )
                    )
    else:
        # Plain string content
        full_text = msg.get_text_content() or ''
        prev_len = text_sent_len.get(msg_id, 0)
        delta_text = full_text[prev_len:]

        if delta_text:
            events.append(
                TextContent(
                    msg_id=msg_id,
                    index=0,
                    delta=True,
                    text=delta_text,
                )
            )
            text_sent_len[msg_id] = len(full_text)

        if last:
            events.append(
                TextContent(
                    msg_id=msg_id,
                    index=0,
                    delta=False,
                    text=full_text,
                )
            )

    return events


@router.post('/chat')
async def chat_endpoint(
    chat_req: RunBody,
    db_session: AsyncSession = Depends(get_db),
):
    thread_id = chat_req.threadId
    run_id = chat_req.runId

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
                runtime_events = _msg_to_runtime_events(
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
                        yield _sse(agui_event)

            # Ensure RUN_FINISHED
            if not adapter.run_finished_emitted:
                yield _sse(
                    adapter.build_run_event(
                        event_type=AGUIEventType.RUN_FINISHED,
                    )
                )

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
            yield _sse(error_event)

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
    return response_base.success(
        data=[
            {
                'thread_id': '13c84e06-55ee-4ad8-9c70-7221d88ab964',
                'chat_title': '新年好',
            },
        ]
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
        agui_msg = {
            'id': d.get('id', ''),
            'role': role,
            'content': str(content),
        }
        agui_messages.append(agui_msg)

    return response_base.success(data=agui_messages)
