# WeMCP

WeMCP is an open-source **MCP & Skills Marketplace** — discover, publish, and debug MCP servers and AI skills in real time. Connect them to your AI agents via a hosted proxy layer, all from a unified web UI.

## Features

- **MCP & Skills Marketplace** — Browse and search public MCP servers and AI skills by category
- **Real-time Debugging** — Test and debug MCP tools and skills directly in the browser with live feedback
- **One-click Import** — Add any `stdio` / `SSE` / `Streamable-HTTP` server from a config snippet or npm/pip package
- **Auto Compilation** — Automatically connects to the server, introspects tools / prompts / resources, and persists the metadata
- **Hosted Proxy** — Wraps local `stdio` servers into a remotely-accessible HTTP endpoint (no client-side runtime required)
- **Agent Chat** — Built-in chat interface backed by CopilotKit + AG-UI; interact with your servers directly in the browser
- **GitHub OAuth** — Sign in with GitHub; servers can be public or private
- **Admin Panel** — Review, approve, and recommend servers; manage users and categories
- **i18n** — Chinese / English interface

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, Tailwind CSS, Radix UI, CopilotKit |
| Backend | Python 3.10+, FastAPI, Celery, SQLAlchemy 2, Alembic |
| Database | MySQL 8 (PostgreSQL also supported) |
| Cache / Queue | Redis |
| Proxy | Caddy 2 |
| MCP Runtime | `fastmcp`, `mcp` SDK |

## Prerequisites

| Requirement | Minimum |
|---|---|
| CPU | 4 virtual cores |
| RAM | 8 GB |
| Docker | 19.03.9+ |
| Docker Compose | 1.25.1+ |

## Quick Start

```shell
git clone https://github.com/tomeai/wemcp.git
cd wemcp

# Copy and edit the environment file
cp backend/deploy/.env.server.example backend/deploy/.env.server

# Start all services
cd docker
docker compose up -d
```

Once running, the web UI is available at `http://localhost` (port 80).

### Environment Variables

Edit `backend/deploy/.env.server` before the first run:

```env
# Database
DATABASE_TYPE=mysql
DATABASE_HOST=wemcp_mysql
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password

# Redis
REDIS_HOST=wemcp_redis
REDIS_PORT=6379

# Auth secrets (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
TOKEN_SECRET_KEY=...
OPERA_LOG_ENCRYPT_SECRET_KEY=...

# GitHub OAuth (https://github.com/settings/developers)
OAUTH2_GITHUB_CLIENT_ID=...
OAUTH2_GITHUB_CLIENT_SECRET=...

# AI provider (DashScope / Alibaba Cloud)
DASHSCOPE_API_KEY=sk-...

# Serverless (for hosted proxy, optional)
SERVERLESS_PROVIDER=aliyun
SERVERLESS_ENDPOINT=...
SERVERLESS_ACCESS_KEY_ID=...
SERVERLESS_ACCESS_KEY_SECRET=...
```

## Architecture

```
Browser
  │
  ▼
Caddy (TLS termination + reverse proxy)
  ├── /        →  wemcp-studio  (Next.js, port 3000)
  └── /api/*   →  wemcp-server  (FastAPI, port 8000)
                      │
                      ├── wemcp-worker  (Celery, port 8555)
                      ├── MySQL  (port 3306)
                      └── Redis  (port 6379)
```

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

## License

[MIT](LICENSE)
