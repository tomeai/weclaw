# AGENTS.md

This file provides guidance for AI agents working in the WeMCP codebase.

## Project Overview

WeMCP is an open-source **MCP & Skills Marketplace** — discover, publish, and debug MCP servers and AI skills in real time. It connects them to AI agents via a hosted proxy layer, all from a unified web UI.

## Repository Layout

```
wemcp/
├── backend/          # Python FastAPI backend
│   ├── app/
│   │   ├── admin/    # Admin panel (user mgmt, review, approval)
│   │   ├── agent/    # Agent chat (CopilotKit / AG-UI threads)
│   │   ├── mcp/      # MCP server management & proxy
│   │   ├── skills/   # AI skills marketplace
│   │   └── task/     # Background task tracking
│   ├── core/         # Config, path constants, service registrar
│   ├── common/       # Shared utilities
│   ├── middleware/   # FastAPI middleware
│   ├── database/     # DB engine setup
│   ├── alembic/      # DB migrations
│   └── main.py       # FastAPI app entry point
├── frontend/         # Next.js 15 frontend
│   ├── app/          # Next.js App Router pages
│   │   ├── mcp/      # MCP marketplace UI
│   │   ├── skills/   # Skills marketplace UI
│   │   ├── agent/    # Agent chat UI
│   │   ├── agui/     # AG-UI integration
│   │   └── user/     # User profile / settings
│   ├── components/   # Shared React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Client utilities
├── docker/           # Docker Compose configs & SQL init
├── skills/           # Skill design assets / templates
└── imgs/             # Project screenshots
```

## Tech Stack

| Layer         | Technology                                             |
|---------------|--------------------------------------------------------|
| Frontend      | Next.js 15, React, Tailwind CSS, Radix UI, CopilotKit  |
| Backend       | Python 3.10+, FastAPI, Celery, SQLAlchemy 2, Alembic   |
| Database      | MySQL 8 (PostgreSQL also supported)                    |
| Cache / Queue | Redis                                                  |
| Proxy         | Caddy 2                                                |
| MCP Runtime   | `fastmcp`, `mcp` SDK                                   |

## Backend Conventions

### Module Structure

Each domain module (`mcp`, `agent`, `skills`, `admin`, `task`) follows the same layout:

```
<module>/
├── api/
│   ├── router.py       # Registers versioned sub-routers
│   └── v1/             # Endpoint handlers (one file per resource)
├── crud/               # SQLAlchemy CRUD operations
├── model/              # SQLAlchemy ORM models
├── schema/             # Pydantic request/response schemas
└── service/            # Business logic layer
```

### Key Rules

- **Python version**: 3.10+; use `uv` for dependency management (`uv sync`).
- **Package manager**: `uv` — do **not** use `pip install` directly.
- **ORM**: SQLAlchemy 2 async with `sqlalchemy-crud-plus`. Always use async sessions.
- **Migrations**: Alembic. After changing a model run `alembic revision --autogenerate -m "description"` then `alembic upgrade head`.
- **Validation**: Pydantic v2 schemas for all request bodies and responses.
- **Router registration**: All routers are collected in `backend/app/router.py` → `main.py`.
- **Background tasks**: Celery with Redis broker. Task logic lives in `app/task/`.
- **Logging**: Use `loguru` — never use `print()` for production logs.
- **Env config**: Settings loaded via `pydantic-settings` from `.env` (copied from `deploy/.env.server.example`).

### Running the Backend (Dev)

```shell
cd backend
uv sync
source .venv/bin/activate
cp deploy/.env.server .env
alembic upgrade head
python run.py                  # API server
wemcp celery worker            # Celery worker (separate terminal)
wemcp celery beat              # Celery beat scheduler (separate terminal)
```

## Frontend Conventions

### Key Rules

- **Package manager**: `pnpm` — do **not** use `npm` or `yarn`.
- **Router**: Next.js 15 App Router (file-system routing under `app/`).
- **Styling**: Tailwind CSS + `tailwind-merge` + `class-variance-authority`.
- **UI primitives**: Radix UI components (shadcn/ui pattern).
- **Icons**: `lucide-react` and `@phosphor-icons/react`.
- **HTTP client**: `axios` for REST calls; `@ai-sdk/*` for AI streaming.
- **Agent UI**: CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`) and AG-UI (`@ag-ui/client`).
- **Notifications**: `sonner` toast library.
- **Animations**: `motion` (Framer Motion).
- **i18n**: Chinese / English; keep UI strings localizable.

### Running the Frontend (Dev)

```shell
cd frontend
pnpm install
pnpm dev          # http://localhost:3000
```

## Code Quality

```shell
# Install pre-commit hooks (run once)
pre-commit install

# Run all linters / formatters manually
pre-commit run --all-files
```

## Docker / Production

```shell
cd docker
cp ../backend/deploy/.env.server.example ../backend/deploy/.env.server
# Edit .env.server with real credentials
docker compose up -d
```

## Common Pitfalls

- Always activate the Python virtualenv before running backend commands.
- Never commit secrets or `.env` files.
- Alembic migrations must be created and applied before starting the API server after model changes.
- Frontend and backend run on separate ports in dev (`3000` vs `8000`); CORS is configured in backend middleware.
- Celery workers must be running for compilation / proxy tasks to execute.
- MCP server compilation validates `username + server_title` uniqueness.
