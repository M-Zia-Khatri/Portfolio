# Production Remediation Guide

This guide documents the production security, deployment, and runtime hardening changes made to the portfolio application. It is intended for operators deploying the React/Vite frontend, Express backend, Prisma, MariaDB, and Redis stack with Docker Compose.

## Executive Summary

The remediation focused on five production-safety goals:

1. **Secret hygiene**: keep real environment files out of Git and Docker images, and document safe placeholder-only examples.
2. **Environment-driven deployment**: remove production localhost fallbacks and require explicit domain/IP configuration.
3. **Container-safe networking**: communicate between services over Docker DNS names (`db`, `redis`, `server`) and avoid exposing internal data stores publicly.
4. **Runtime hardening**: add health/readiness endpoints, structured startup logs, explicit `0.0.0.0` binding, and graceful shutdown.
5. **Repeatable releases**: keep Prisma migration/seed execution deployment-safe and validate frontend API configuration at build time.

## Changed Files and Rationale

| File | Purpose of Change |
| --- | --- |
| `.env.example` | Replaced weak sample values with `CHANGE_ME` placeholders and added root Compose variables, including `VITE_API_URL`. |
| `.gitignore` | Ensures `.env` and `.env.*` files remain untracked while `.env.example` files stay committed. |
| `.dockerignore` | Prevents real env files, dependency folders, build output, Git metadata, logs, and editor files from being copied into Docker contexts. |
| `server/.env.example` | Documents required backend production variables, Docker service hostnames, CORS origins, JWT secrets, cookie settings, mailer values, seed admin values, and Cloudinary values. |
| `docker-compose.yml` | Removes public MariaDB/Redis ports, keeps internal services on the Compose network, adds health checks, and passes `VITE_API_URL` into the frontend image build. |
| `server/src/config/env.ts` | Adds production startup validation for required CORS/client/JWT variables and centralizes cookie/Redis configuration. |
| `server/src/app.ts` | Adds credentialed CORS with an explicit allowlist, production fail-fast origin validation, structured startup logs, `/health`, and `/ready`. |
| `server/src/server.ts` | Binds the server to `0.0.0.0` and gracefully handles `SIGTERM`/`SIGINT` by closing HTTP, Prisma, and Redis resources. |
| `server/src/controllers/auth.controller.ts` | Uses centralized cookie configuration for refresh-token set/clear operations. |
| `server/src/lib/utills/redis.ts` | Uses the configured Redis host instead of an implicit localhost production fallback. |
| `server/Dockerfile` | Builds in stages and keeps the runtime image limited to production dependencies, compiled output, Prisma files, generated client, and package metadata. |
| `client/src/shared/api/axios.ts` | Removes the `localhost` API fallback and throws immediately when `VITE_API_URL` is missing. |
| `client/vite.config.ts` | Fails production builds when `VITE_API_URL` is absent. |
| `client/Dockerfile` | Accepts `VITE_API_URL` as a build argument and injects it for the Vite production build. |
| `docker-compose.db.yml` | Keeps the local-only DB/Redis stack explicit, configurable through `LOCAL_*` variables, networked on a local bridge, and health-checked. |
| `Makefile` | Uses the detected `DOCKER_COMPOSE` command consistently for local DB helper targets. |

## Secret Hygiene

### What changed

Real secret-bearing environment files should never be committed or included in Docker images. The repository now protects these files in two places:

- Git ignores `.env` and `.env.*` while allowing `.env.example` files.
- Docker ignores `.env` and `.env.*` while allowing `.env.example` files.

### Operator action required

Rotate all values that may have been used in production, including:

- Database root password
- Database application password
- JWT access secret
- JWT refresh secret
- SMTP credentials
- Cloudinary API secret
- Seed admin password

Then create real environment files from the examples:

```bash
cp .env.example .env
cp server/.env.example server/.env.production
cp client/.env.example client/.env.production
```

Replace every `CHANGE_ME` value before deploying.

## Required Production Environment Variables

### Root `.env`

Used by Docker Compose interpolation.

```dotenv
DB_ROOT_PASSWORD=CHANGE_ME_ROOT_PASSWORD
DATABASE_NAME=portfolio
DATABASE_USER=portfolio_user
DATABASE_PASSWORD=CHANGE_ME_DATABASE_PASSWORD
DATABASE_PORT=3306
DATABASE_URL=mysql://portfolio_user:CHANGE_ME_DATABASE_PASSWORD@db:3306/portfolio
PORT=5000
CLIENT_PORT=80
VITE_API_URL=https://api.yourdomain.com/api
```

### Backend `server/.env.production`

Minimum production values:

```dotenv
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://portfolio_user:CHANGE_ME@db:3306/portfolio
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_USER=portfolio_user
DATABASE_PASSWORD=CHANGE_ME
DATABASE_NAME=portfolio
DB_ROOT_PASSWORD=CHANGE_ME_ROOT
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379
CLIENT_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
COOKIE_SECURE=true
COOKIE_SAMESITE=none
COOKIE_DOMAIN=yourdomain.com
JWT_ACCESS_SECRET=CHANGE_ME_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_LONG_RANDOM_SECRET
```

### Frontend `client/.env.production`

```dotenv
VITE_API_URL=https://api.yourdomain.com/api
VITE_CLOUDINARY_UPLOAD_PRESET=CHANGE_ME
VITE_CLOUDINARY_CLOUD_NAME=CHANGE_ME
```

## CORS and Cookie Configuration

Production requires `CORS_ORIGINS` and `CLIENT_URL`. The server fails startup if either value is missing in production. Use a comma-separated allowlist for browser origins:

```dotenv
CLIENT_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://203.0.113.10
```

Refresh tokens are stored in an HTTP-only cookie. Use these defaults for cross-site frontend/API deployments over HTTPS:

```dotenv
COOKIE_SECURE=true
COOKIE_SAMESITE=none
COOKIE_DOMAIN=yourdomain.com
```

For same-site deployments, `COOKIE_SAMESITE=lax` may be used. Do not use `COOKIE_SECURE=false` in public production HTTPS deployments.

## Docker Networking and Exposure

Production Compose now treats MariaDB and Redis as internal services only:

- Backend-to-database hostname: `db`
- Backend-to-Redis hostname: `redis`
- Frontend-to-backend browser URL: configured by `VITE_API_URL`

MariaDB and Redis no longer publish host ports in production Compose. If an operator needs temporary database access, prefer one-off commands inside the Compose network instead of re-exposing ports publicly.

Example:

```bash
docker compose exec db mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" "$DATABASE_NAME"
```

## Prisma Migration and Seed Safety

The `migrator` service runs:

```bash
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
```

The admin seed is idempotent because it uses Prisma `upsert` keyed by email. Re-running the seed updates the existing admin record rather than creating duplicates.

## Frontend API Validation

The frontend no longer falls back to a localhost API URL. Both the Axios API client and the Vite production build require `VITE_API_URL`.

Expected failure when omitted:

```bash
cd client
env -u VITE_API_URL NODE_ENV=production pnpm exec vite build
# Error: Missing VITE_API_URL
```

Expected production build:

```bash
cd client
VITE_API_URL=https://api.yourdomain.com/api pnpm build
```

## Health and Readiness Checks

Backend endpoints:

- `GET /health` returns process liveness.
- `GET /ready` returns application readiness.

Docker Compose also defines health checks for:

- MariaDB
- Redis
- Backend
- Frontend/nginx

## Docker Audit Findings and Fixes

### Critical

- **Backend container startup override**: `docker-compose.yml` previously overrode the backend image command with `pnpm start`. The optimized runtime image does not install or activate pnpm, so the container could fail at startup even though the Dockerfile `CMD` was valid. The Compose override was removed so the image starts with `node dist/src/server.js`.

### High

- **Health checks targeting wildcard addresses**: service health checks used `0.0.0.0` as a destination address. That address is valid for binding but is not a precise service-discovery target. Health checks now use Docker service names (`server`, `client`) where Compose networking is available.
- **Runtime container user**: the backend runtime image now runs as the non-root `node` user and copies runtime files with `node:node` ownership.

### Medium

- **No Compose resource guardrails**: production services lacked CPU/memory limits. Compose now defines conservative `cpus` and `mem_limit` values that operators can tune per VPS size.
- **Unbounded container logs**: production services now use the `json-file` driver with size and file-count limits to avoid filling VPS disks.
- **Local DB Compose hardcoded credentials and no Redis health check**: `docker-compose.db.yml` now uses `LOCAL_*` variable defaults, has a local-only bridge network, enables Redis append-only persistence, and adds a Redis health check.

### Low

- **Makefile Compose command drift**: local DB helper targets now use the detected `DOCKER_COMPOSE` command instead of hardcoded `docker compose`.
- **Dockerignore typo**: the backend `.dockerignore` had a stray trailing character, which was removed.


### Build Failure: `pnpm prisma generate`

The Docker build failed in the backend `builder` stage at `RUN pnpm prisma generate` with:

```text
ERROR packages field missing or empty
```

Root cause: invoking Prisma through `pnpm prisma generate` is ambiguous under pnpm in this package because `package.json` also contains a top-level `prisma` configuration object for seed metadata. In Docker, pnpm resolved the command path incorrectly instead of reliably executing the Prisma CLI binary. The Dockerfile now uses the unambiguous binary invocation:

```dockerfile
RUN pnpm exec prisma generate
```

This matches the verified local command and ensures the Prisma CLI from `node_modules/.bin` is executed in the builder stage.

## Corrected Container Architecture

Production startup order is health-check based:

```text
db healthy
  -> migrator completes migrations and idempotent seed
  -> redis healthy + migrator completed
  -> server healthy
  -> client healthy
```

Runtime traffic flow:

- Browser traffic reaches the frontend through the published client port.
- Browser API calls use `VITE_API_URL`, which must point to the externally reachable backend API.
- The backend reaches MariaDB with Docker DNS name `db`.
- The backend reaches Redis with Docker DNS name `redis`.
- MariaDB and Redis remain internal-only in the production Compose file.

## Deployment Procedure

1. Pull the latest code.
2. Create or update `.env`, `server/.env.production`, and `client/.env.production` from the example files.
3. Rotate and replace all secrets.
4. Confirm these critical values use Docker service names internally:
   - `DATABASE_URL=...@db:3306/...`
   - `DATABASE_HOST=db`
   - `REDIS_HOST=redis`
   - `REDIS_URL=redis://redis:6379`
5. Confirm browser-facing values use your real domain or VPS IP:
   - `CLIENT_URL`
   - `CORS_ORIGINS`
   - `VITE_API_URL`
6. Build and deploy:

```bash
docker compose build --no-cache
docker compose up -d
```

7. Verify service health:

```bash
docker compose ps
curl -fsS https://api.yourdomain.com/health
curl -fsS https://api.yourdomain.com/ready
```

8. Inspect logs for structured startup messages:

```bash
docker compose logs -f server
```

## Validation Checklist

Before considering a production deployment complete, verify:

- [ ] No real `.env` files are tracked by Git.
- [ ] Docker images do not receive `.env` files through the build context.
- [ ] MariaDB has no public host port mapping in production Compose.
- [ ] Redis has no public host port mapping in production Compose.
- [ ] Backend container starts with the Dockerfile `CMD`; there is no Compose `pnpm start` override.
- [ ] Production services have log rotation and resource guardrails set or intentionally tuned.
- [ ] `CORS_ORIGINS` includes every production browser origin.
- [ ] `VITE_API_URL` points to the externally reachable backend API base URL.
- [ ] `COOKIE_SECURE=true` for HTTPS deployments.
- [ ] `COOKIE_SAMESITE` matches the frontend/API topology.
- [ ] Prisma migrations complete successfully.
- [ ] Admin seed can be re-run without duplicate admin users.
- [ ] `/health` and `/ready` return successful responses.

## Troubleshooting

### Server exits immediately in production

Check for missing required variables:

- `CORS_ORIGINS`
- `CLIENT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

### Frontend build fails with `Missing VITE_API_URL`

Set `VITE_API_URL` in the root `.env` for Compose build interpolation and in `client/.env.production` for frontend environment documentation.

### Browser receives CORS errors

Add the exact browser origin, including scheme and port if applicable, to `CORS_ORIGINS`.

### Refresh-token cookie is not sent

Verify:

- Frontend requests use credentials.
- CORS has `credentials: true`.
- `COOKIE_SECURE=true` when using HTTPS.
- `COOKIE_SAMESITE=none` for cross-site frontend/API deployments.
- `COOKIE_DOMAIN` matches the registrable domain used by frontend and API.

