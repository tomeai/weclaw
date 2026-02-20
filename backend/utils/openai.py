from core.conf import settings
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=settings.DASHSCOPE_API_KEY, base_url='https://dashscope.aliyuncs.com/compatible-mode/v1')


async def call_model(query: str):
    response = await client.chat.completions.create(
        model='qwen3.5-plus',
        messages=[
            {'role': 'user', 'content': f'用10字以内总结以下问题的主题，只返回标题文本，不要加引号和标点：{query}'}
        ],
        extra_body={'enable_thinking': False},
    )
    return response.choices[0].message.content
