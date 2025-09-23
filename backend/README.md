## WeMCP

## Development

```
wemcp celery worker
wemcp celery beat
# admin:123456
wemcp celery flower
```

## virtualenv

```
uv sync
.\.venv\Scripts\activate
```

## Migrate

```
alembic revision --autogenerate
alembic upgrade head
```

## lint

```
pre-commit install
pre-commit run --all-files
```