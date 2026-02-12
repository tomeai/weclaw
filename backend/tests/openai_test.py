from openai import OpenAI

client = OpenAI(
    base_url='http://127.0.0.1:9000/compatible-mode/v1',
    api_key='dummy',
)
# resp = client.responses.create(
#     model="Friday",
#     input="你好",
#     stream=True,
# )
# print(resp.response["output"][0]["content"][0]["text"])

with client.responses.stream(
    model='Friday',
    input='你好',
) as stream:
    for event in stream:
        print(event)
