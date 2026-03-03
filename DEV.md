## Development

### Backend

```shell
cd backend

# Install dependencies
uv sync

# Activate virtualenv
source .venv/bin/activate          # Linux / macOS
# .\.venv\Scripts\activate         # Windows

# Copy env file
cp deploy/.env.server .env

# Run database migrations
alembic upgrade head

# Start the API server
python run.py

# Start Celery worker (separate terminal)
wemcp celery worker

# Start Celery beat scheduler (separate terminal)
wemcp celery beat

# Celery monitoring UI at http://localhost:8555 (admin:123456)
wemcp celery flower
```

### Frontend

```shell
cd frontend
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:3000`.

### Code Quality

```shell
# Install pre-commit hooks
pre-commit install

# Run all checks manually
pre-commit run --all-files
```

### Database Migrations

```shell
# Generate a new migration after model changes
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```