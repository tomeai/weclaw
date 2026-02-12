import requests

url = 'http://127.0.0.1:8000/api/v1/agent/chat'

body = {'type': 'mcp', 'owner': '1', 'name': 'xx', 'message': '北京天气怎么样'}
with requests.post(url, json=body, stream=True) as response:
    for line in response.iter_lines():
        if line:
            print(line)
