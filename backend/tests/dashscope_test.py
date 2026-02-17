import asyncio

from core.conf import settings
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=settings.DASHSCOPE_API_KEY, base_url='https://dashscope.aliyuncs.com/compatible-mode/v1')


async def main():
    response = await client.chat.completions.create(
        model='qwen3.5-plus',
        messages=[
            {
                'role': 'user',
                'content': '用10字以内总结以下问题的主题，只返回标题文本，不要加引号和标点：大望路到北京动物园怎么走',
            }
        ],
        # stream=True,  # 明确启用流式输出
        extra_body={'enable_thinking': False},
    )
    print(response.choices[0].message.content)


if __name__ == '__main__':
    asyncio.run(main())
