import asyncio
import os

from typing import Any

import dotenv

from agentscope.agent import AgentBase, ReActAgent
from agentscope.formatter import DashScopeChatFormatter, FormatterBase
from agentscope.mcp import HttpStatelessClient
from agentscope.memory import InMemoryMemory
from agentscope.message import Msg
from agentscope.model import DashScopeChatModel
from agentscope.tool import Toolkit, execute_python_code
from agentscope.tracing import trace_format

dotenv.load_dotenv()


def instance_post_print_hook(
    self: AgentBase,
    kwargs: dict[str, Any],
    output: Any,  # print 的返回值（通常是 None，因为 print 本身可能不返回信息，或框架定义）
) -> Any:
    """修改消息内容的前置回复钩子。"""
    kwargs.get('msg')
    kwargs.get('last', None)
    print('last', output)

    # 做你想做的事情，例如写日志、发送 telemetry 等
    # 然后返回 output（或修改后的）
    return output


def instance_pre_print_hook(
    self: AgentBase,
    kwargs: dict[str, Any],
) -> dict[str, Any]:
    """修改消息内容的前置回复钩子。"""
    msg = kwargs['msg']
    print('pre msg', msg)
    # msg.content += "[instance-pre-reply]"
    # 返回修改后的 kwargs
    return {
        **kwargs,
        'msg': msg,
    }


def instance_pre_reply_hook(
    self: AgentBase,
    kwargs: dict[str, Any],
) -> dict[str, Any]:
    """修改消息内容的前置回复钩子。"""
    msg = kwargs['msg']
    print('pre reply msg', msg)
    # msg.content += "[instance-pre-reply]"
    # 返回修改后的 kwargs
    return {
        **kwargs,
        'msg': msg,
    }


class ExampleFormatter(FormatterBase):
    """简单的示例格式化器类"""

    @trace_format
    async def format(self, *args: Any, **kwargs: Any) -> list[dict]:
        """示例格式化"""
        print('format', args, kwargs)
        return []


async def creating_react_agent() -> None:
    """创建一个 ReAct 智能体并运行一个简单任务。"""
    # 准备工具
    toolkit = Toolkit()
    toolkit.register_tool_function(execute_python_code)
    stateless_client = HttpStatelessClient(
        # 用于标识 MCP 的名称
        name='mcp_services_stateless',
        transport='streamable_http',
        url=f'https://mcp.amap.com/mcp?key={os.environ["GAODE_API_KEY"]}',
    )
    await toolkit.register_mcp_client(
        stateless_client,
        # group_name="map_services",  # 可选的组名
    )
    jarvis = ReActAgent(
        name='Jarvis',
        sys_prompt='你是一个名为 Jarvis 的助手',
        model=DashScopeChatModel(
            model_name='qwen-max',
            api_key=os.environ['DASHSCOPE_API_KEY'],
            stream=True,
            enable_thinking=False,
        ),
        formatter=DashScopeChatFormatter(),
        toolkit=toolkit,
        memory=InMemoryMemory(),
    )

    # jarvis.register_instance_hook(
    #     hook_type="pre_print",
    #     hook_name="test_pre_reply",
    #     hook=instance_pre_print_hook,
    # )
    # jarvis.register_instance_hook(
    #     hook_type="pre_reply",
    #     hook_name="test_pre_reply",
    #     hook=instance_pre_reply_hook,
    # )
    jarvis.register_instance_hook(
        hook_type='post_print',
        hook_name='test_post_print',
        hook=instance_post_print_hook,
    )

    msg = Msg(
        name='user',
        content='中关村壹号到北京动物园怎么去',
        role='user',
    )

    await jarvis(msg)

    jarvis.clear_instance_hooks()


if __name__ == '__main__':
    asyncio.run(creating_react_agent())
