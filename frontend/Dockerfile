# Base Node.js image
FROM node:20-alpine AS base

# ======================
# Set build arguments for COS credentials
# ======================
ENV COS_SECRET_ID=$COS_SECRET_ID
ENV COS_SECRET_KEY=$COS_SECRET_KEY
ENV COS_BUCKET=$COS_BUCKET
ENV COS_REGION=$COS_REGION

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

RUN apk add --no-cache ca-certificates curl

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm config set registry https://registry.npmmirror.com \
    && pnpm config set fetch-timeout 600000 \
    && pnpm config set fetch-retries 5

# Copy package files
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Set Next.js telemetry to disabled
ENV NEXT_TELEMETRY_DISABLED=1

# Copy production environment variables for build
COPY .env.production .env.production

# Build the application
RUN npm run build

# Verify standalone build was created
RUN ls -la .next/ && \
    if [ ! -d ".next/standalone" ]; then \
      echo "ERROR: .next/standalone directory not found. Make sure output: 'standalone' is set in next.config.ts"; \
      exit 1; \
    fi

RUN wget https://cosbrowser.cloud.tencent.com/software/coscli/coscli-linux-amd64 -O /usr/local/bin/coscli && \
    chmod +x /usr/local/bin/coscli && \
    coscli --version

# ======================
# Upload static files to COS
# ======================
RUN coscli sync .next/static cos://${COS_BUCKET}/next-static/ \
      --region $COS_REGION --force && \
    coscli sync public cos://${COS_BUCKET}/public/ \
      --region $COS_REGION --force

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check to verify container is running properly
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
