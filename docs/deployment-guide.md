# Deployment Guide

## Verified vs Inferred Legend
- **Verified finding**: directly confirmed from repository files.
- **Inferred finding**: likely true based on code patterns, but not explicitly configured.
- **Missing information**: required for production but not present in repository.

---

## 1) Project Overview

### Architecture Summary
- **Verified:** Monorepo with two apps: `client` (frontend) and `server` (backend), orchestrated from root via pnpm scripts. 
- **Verified:** Frontend served as static build by Nginx container in production. 
- **Verified:** Backend is Node.js + Express API exposing routes under `/api`.
- **Verified:** Data layer uses Prisma with MySQL/MariaDB and Redis.
- **Verified:** Docker Compose includes `db`, `migrator`, `redis`, `server`, and `client` services.

### Stack Summary
- Frontend: React 19 + Vite + TypeScript + Tailwind + React Query + Zustand. **(Verified)**
- Backend: Express 5 + TypeScript + Prisma + JWT + Redis + Cloudinary + Nodemailer. **(Verified)**
- DB: MariaDB 11 (MySQL protocol), Prisma ORM. **(Verified)**
- Package manager: pnpm (workspace-style usage). **(Verified)**
- CI/CD: GitHub Actions for client/server validation + image build/push to GHCR + placeholder deploy. **(Verified)**

---

## 2) Prerequisites

### Required Software
- Node.js 20.x
- pnpm (Corepack recommended)
- Docker + Docker Compose plugin
- Git

### Required Accounts / Services
- Container registry access (GHCR in current workflow)
- MariaDB database (self-hosted/container/cloud)
- Redis instance
- Cloudinary account (if portfolio image upload is used)
- SMTP provider for mail features

### Runtime Ports (default expected)
- Client Nginx: `80` inside container (`CLIENT_PORT` host mapped)
- Server: `5000` inside container (`PORT` host mapped)
- MariaDB: `3306` inside container (`DATABASE_PORT` host mapped)
- Redis: `6379`

---

## 3) Environment Variables

## 3.1 Backend Variables (server)

| Variable | Required | Purpose | Example (production) |
|---|---:|---|---|
| `NODE_ENV` | Yes | Selects env file and runtime mode | `production` |
| `PORT` | Yes | API listen port | `5000` |
| `DATABASE_URL` | Yes | Prisma DB connection | `mysql://user:pass@db:3306/portfolio` |
| `DATABASE_HOST` | Yes | Host for app DB config | `db` |
| `DATABASE_PORT` | Yes | DB port | `3306` |
| `DATABASE_USER` | Yes | DB user | `portfolio_user` |
| `DATABASE_PASSWORD` | Yes | DB password | `strong-password` |
| `DATABASE_NAME` | Yes | DB name | `portfolio` |
| `DB_ROOT_PASSWORD` | Yes (compose db) | MariaDB root password | `strong-root-password` |
| `REDIS_HOST` | Yes | Redis host | `redis` |
| `REDIS_PORT` | Yes | Redis port | `6379` |
| `REDIS_URL` | Optional | Alternate redis URL fallback | `redis://redis:6379` |
| `CLIENT_URL` | Yes | Browser CORS allowlist fallback target | `https://yourdomain.com` |
| `CORS_ORIGINS` | Recommended | CSV allowlist | `https://yourdomain.com,https://www.yourdomain.com` |
| `RATE_LIMIT_BYPASS` | Optional | Disables limiter if true | `false` |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret | `<64+ char random>` |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret | `<64+ char random>` |
| `SMTP_HOST` | Optional/Feature-based | Outbound mail host | `smtp.sendgrid.net` |
| `SMTP_PORT` | Optional | Outbound mail port | `587` |
| `SMTP_SECURE` | Optional | TLS mode flag | `false` |
| `SMTP_USER` | Optional/Feature-based | SMTP auth user | `apikey` |
| `SMTP_PASS` | Optional/Feature-based | SMTP auth pass | `<secret>` |
| `SMTP_FROM` | Optional/Feature-based | Sender address | `noreply@yourdomain.com` |
| `SEED_ADMIN_EMAIL` | Yes (seed path) | Admin bootstrap email | `admin@yourdomain.com` |
| `SEED_ADMIN_PASSWORD` | Yes (seed path) | Admin bootstrap password | `<secret>` |
| `SEED_ADMIN_NAME` | Yes (seed path) | Admin bootstrap name | `Admin` |
| `CLOUDINARY_CLOUD_NAME` | Required if upload used | Cloudinary config | `<cloud_name>` |
| `CLOUDINARY_API_KEY` | Required if upload used | Cloudinary config | `<api_key>` |
| `CLOUDINARY_API_SECRET` | Required if upload used | Cloudinary config | `<api_secret>` |

## 3.2 Frontend Variables (client)

| Variable | Required | Purpose | Example |
|---|---:|---|---|
| `VITE_API_URL` | Yes | Backend API base URL | `https://api.yourdomain.com/api` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Required if upload used | Client-side Cloudinary preset | `<preset>` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Required if upload used | Cloud name for upload endpoint | `<cloud_name>` |

## 3.3 Variables that should NOT be committed
- All `.env*` files with real credentials (`.gitignore` already ignores `.env*`).
- JWT secrets, DB passwords, SMTP credentials, Cloudinary API secret.

## 3.4 `.env.example` templates

### `server/.env.example`
```env
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
RATE_LIMIT_BYPASS=false

JWT_ACCESS_SECRET=CHANGE_ME_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_LONG_RANDOM_SECRET

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=CHANGE_ME
SMTP_PASS=CHANGE_ME
SMTP_FROM=noreply@yourdomain.com

SEED_ADMIN_EMAIL=admin@yourdomain.com
SEED_ADMIN_PASSWORD=CHANGE_ME
SEED_ADMIN_NAME=Admin

CLOUDINARY_CLOUD_NAME=CHANGE_ME
CLOUDINARY_API_KEY=CHANGE_ME
CLOUDINARY_API_SECRET=CHANGE_ME
```

### `client/.env.example`
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_CLOUDINARY_UPLOAD_PRESET=CHANGE_ME
VITE_CLOUDINARY_CLOUD_NAME=CHANGE_ME
```

---

## 4) Local Production Deployment

### Option A: Docker Compose (recommended)
```bash
cp server/.env.example server/.env.production
cp client/.env.example client/.env.production
# edit both files with real values

docker compose build
docker compose up -d

docker compose ps
docker compose logs -f server
```

Why: Compose includes startup ordering, DB/Redis health checks, and one-shot Prisma migrate+seed via `migrator`.

### Option B: Manual (without Docker)
```bash
# terminal 1: database + redis must already exist externally
cd server
pnpm install
NODE_ENV=production pnpm prisma generate
NODE_ENV=production pnpm prisma migrate deploy
NODE_ENV=production pnpm prisma db seed
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start

# terminal 2: client
cd client
pnpm install
pnpm build
pnpm preview --host
```

Why: useful for platform-native processes or debugging container issues.

---

## 5) Docker Deployment Analysis

### Verified Current State
- Server Dockerfile uses multi-stage build, generates Prisma client, compiles TS, then runs dist output.
- Client Dockerfile uses multi-stage build and serves built assets via Nginx.
- Compose includes `migrator` service for deployment-time schema and seed.

### Gaps / Improvements
1. **Deployment blocker:** Compose expects `server/.env.production` and `client/.env.production`, but templates are missing in repo.
2. **Security:** Redis port exposed publicly (`6379:6379`). Restrict in production unless externally needed.
3. **Server image size/perf:** runtime image currently copies full `src`; not necessary when running dist only.
4. **Health checks:** backend checks `/` route, good; consider dedicated `/healthz` with dependency checks.
5. **Least privilege:** add non-root user in runtime images.

---

## 6) VPS Deployment (Ubuntu + Docker + Nginx + SSL)

### 6.1 Server bootstrap
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg ufw
```

### 6.2 Docker install
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

### 6.3 Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 6.4 Deploy app
```bash
git clone <your-repo-url>
cd My-Portfolio
cp server/.env.example server/.env.production
cp client/.env.example client/.env.production
# edit secrets safely

docker compose up -d --build
```

### 6.5 Reverse proxy + SSL (host Nginx, optional pattern)
- Either expose `client` directly on 80/443 via host proxy to container port, or use edge load balancer.
- Use Certbot for Let’s Encrypt cert issuance and renewals.

---

## 7) Database Setup (Prisma)

### Migration Flow (production)
```bash
cd server
NODE_ENV=production pnpm prisma migrate deploy
NODE_ENV=production pnpm prisma db seed
```

### Backup Recommendations
- Daily logical dump (`mysqldump`) + encrypted offsite storage.
- Keep binary logs if point-in-time restore is required.
- Test restore monthly in staging.

---

## 8) CI/CD Review

### Already Automated (Verified)
- Client install, lint, and build.
- Server install and Prisma client generation.
- Docker image build and push to GHCR on push to `main`/`develop`.

### Missing / Gaps
- No server test suite execution.
- No Prisma migration validation in CI against ephemeral DB.
- Deploy job is placeholder only (no real deployment action).
- No post-deploy smoke test.

### Recommended CI/CD Additions
1. Add integration smoke checks against ephemeral MariaDB+Redis.
2. Enforce `pnpm build` for server in CI.
3. Add deploy via SSH action or platform API.
4. Add post-deploy health endpoint checks.
5. Use environment-scoped GitHub Secrets and required reviewers for prod env.

---

## 9) Monitoring & Logging

- Docker logs:
```bash
docker compose logs -f server
docker compose logs -f client
docker compose logs -f db
docker compose logs -f redis
```
- PM2 (if manual node runtime chosen):
```bash
pm2 start dist/src/server.js --name portfolio-api
pm2 logs portfolio-api
pm2 save
```
- Add external uptime checks to `/` (and recommended `/healthz`).

---

## 10) Troubleshooting

### Common Failures
1. **`migrator` fails on startup**
   - Cause: invalid `DATABASE_URL` or DB credentials.
   - Fix: verify env file and DB service health.
2. **CORS blocked requests**
   - Cause: missing production domain in `CORS_ORIGINS`.
   - Fix: add exact origin(s), comma-separated.
3. **Frontend calls localhost in production**
   - Cause: missing `VITE_API_URL`.
   - Fix: set to public API endpoint.
4. **Cloudinary errors at runtime**
   - Cause: missing cloudinary secrets; server module throws on startup.
   - Fix: provide required vars or disable upload paths.

---

## 11) Security Recommendations

- Set long random JWT secrets; rotate regularly.
- Keep `.env.production` out of git; use secret manager.
- Restrict DB/Redis exposure to private network only.
- Enforce HTTPS termination and HSTS at edge.
- Add rate limiting and request size limits if not already global.
- Add secure cookie flags (`Secure`, `HttpOnly`, `SameSite`) consistently for auth cookies.
- Run containers as non-root users.

---

## 12) Scaling Recommendations

- Frontend: CDN cache static assets aggressively.
- Backend: horizontal scale API containers behind load balancer.
- Sessions/tokens: keep Redis highly available.
- DB: add read replicas and proper indexing for growth.
- Media: continue offloading uploads to Cloudinary.

---

## Deployment Blockers (Current)

1. Missing committed env templates (`server/.env.example`, `client/.env.example`).
2. Deploy workflow is placeholder and not production-automated.
3. No documented real domain/SSL reverse-proxy topology for API+SPA split.
4. No explicit server health endpoint with dependency checks.

---

## Cloud Platform Recommendations (Pros/Cons)

- **Vercel**: great for frontend; weaker fit for long-running Express+Redis+MariaDB unless split architecture.
- **Render**: simple full-stack deploy, managed services available; potentially higher cost at scale.
- **Railway**: fast DX and easy env management; pricing/resource constraints should be reviewed.
- **Fly.io**: strong for container-first global deploys; networking/storage learning curve.
- **DigitalOcean**: balanced control/cost with droplets + managed DB; more ops ownership.
- **AWS/GCP**: maximum scalability and managed options; highest complexity.

**Best-fit inference for current repo:** Docker-centric deployment on Render, Fly.io, or DigitalOcean App Platform/Droplet is most direct with minimal refactor.
