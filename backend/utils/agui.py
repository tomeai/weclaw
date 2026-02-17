import json

from agentscope.message import Msg
from agentscope_runtime.engine.schemas.agent_schemas import (
    DataContent,
    FunctionCall,
    FunctionCallOutput,
    RunStatus,
    TextContent,
)


def sse(event) -> str:
    """Serialize an ag-ui event to SSE data line."""
    data = event.model_dump(mode='json', exclude_none=True, by_alias=True)
    return f'data: {json.dumps(data, ensure_ascii=False)}\n\n'


def msg_to_runtime_events(
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
