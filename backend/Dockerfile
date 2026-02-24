# Select the image to build based on SERVER_TYPE, defaulting to fastapi_server, or docker-compose build args
ARG SERVER_TYPE=fastapi_server

# === Python environment from uv ===
FROM astral/uv:python3.12-bookworm-slim AS builder

# Used for build Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /wemcp

COPY . .

# Configure uv environment
ENV UV_COMPILE_BYTECODE=1 \
    UV_NO_CACHE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/usr/local

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-default-groups --group server

# === Runtime base server image ===
FROM python:3.12-slim AS base_server

RUN apt-get update \
    && apt-get install -y --no-install-recommends supervisor \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wemcp /wemcp/backend

COPY --from=builder /usr/local /usr/local

COPY deploy/supervisord.conf /etc/supervisor/supervisord.conf

WORKDIR /wemcp/backend

# === FastAPI server image ===
FROM base_server AS fastapi_server

COPY deploy/server.conf /etc/supervisor/conf.d/

RUN mkdir -p /var/log/fastapi_server

EXPOSE 8000

# === Celery server image ===
FROM base_server AS celery

COPY deploy/celery.conf /etc/supervisor/conf.d/

RUN mkdir -p /var/log/celery

RUN apt-get update && apt-get install -y curl gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

RUN node -v && npm -v && npx -v

EXPOSE 8555

# Build image
FROM ${SERVER_TYPE}