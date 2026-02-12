```
curl -X POST http://127.0.0.1:9000/admin/shutdown

curl -N \
  -X POST "http://localhost:9000/process" \
  -H "Content-Type: application/json" \
  -d '{
    "input": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "What is the capital of France?" }
        ]
      }
    ]
  }'
```