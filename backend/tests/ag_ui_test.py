import asyncio

import aiohttp


async def call_ag_ui_endpoint():
    url = 'http://localhost:8090/ag-ui'
    payload = {
        'threadId': 'thread_1234',
        'runId': 'run_4567',
        'messages': [{'id': 'msg_1', 'role': 'user', 'content': '北京今天的天气如何'}],
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as resp:
            assert resp.status == 200
            assert resp.headers['Content-Type'].startswith('text/event-stream')

            async for chunk, _ in resp.content.iter_chunks():
                if not chunk:
                    continue

                line = chunk.decode('utf-8').strip()
                if not line.startswith('data:'):
                    continue
                print(line + '\n')


if __name__ == '__main__':
    asyncio.run(call_ag_ui_endpoint())
