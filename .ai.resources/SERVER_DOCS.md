# Server API — Complete Technical Documentation

> **Stack:** Node.js · Express · TypeScript · Prisma (MariaDB) · Redis · Cloudinary · Nodemailer  
> **Base URL:** `/api`  
> **Auth model:** Two-step login (password → OTP) → JWT access token (15 min) + HttpOnly refresh token cookie (7 days)

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Entry Points](#2-entry-points)
3. [Configuration — `env.ts`](#3-configuration--envts)
4. [Database Schema — Prisma](#4-database-schema--prisma)
5. [Routes Overview](#5-routes-overview)
6. [Authentication (`/api/auth`)](#6-authentication-apiauth)
7. [Skills (`/api/skills`)](#7-skills-apiskills)
8. [Portfolio (`/api/portfolio`)](#8-portfolio-apiportfolio)
9. [Contact (`/api/contact`)](#9-contact-apicontact)
10. [Middlewares](#10-middlewares)
11. [Services](#11-services)
12. [Caching System](#12-caching-system)
13. [Utilities](#13-utilities)
14. [Types](#14-types)
15. [Validators](#15-validators)
16. [Data Flow Diagrams](#16-data-flow-diagrams)
17. [Error Handling](#17-error-handling)
18. [Environment Variables Reference](#18-environment-variables-reference)

---

## 1. Project Structure

```
server/
├── prisma/
│   ├── schema.prisma            # DB models: Admin, OtpToken, RefreshToken, Skill, Portfolio_item, ContactMessage
│   ├── migrations/              # SQL migration history
│   └── seeds/admin.ts           # Seed script for the initial admin user
├── generated/prisma/            # Auto-generated Prisma client (do not edit)
└── src/
    ├── server.ts                # HTTP listener — reads PORT, calls app.listen()
    ├── app.ts                   # Express app factory — CORS, middleware, router mount
    ├── config/
    │   └── env.ts               # Single config object built from process.env
    ├── routes/
    │   ├── index.ts             # Mounts all sub-routers under /api
    │   ├── auth.route.ts        # /api/auth/*
    │   ├── skill.route.ts       # /api/skills/*
    │   ├── portfolio.route.ts   # /api/portfolio/*
    │   └── contact.route.ts     # /api/contact/*
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── skill.controller.ts
    │   ├── portfolio.controller.ts
    │   └── contact.controller.ts
    ├── middlewares/
    │   ├── auth.middleware.ts        # requireAdmin — validates Bearer JWT
    │   ├── contact.middleware.ts     # validateContact — body validation
    │   └── rate-limit/
    │       ├── rate-limit.middleware.ts   # rateLimit() factory
    │       ├── rate-limit.helpers.ts      # buildRedisKey, getIp, headers
    │       ├── rate-limit.fallback.ts     # In-memory fallback when Redis is down
    │       ├── rate-limit.script.ts       # Lua sliding-window script
    │       └── rate-limit.types.ts        # Tier, RateLimitConfig interfaces
    └── lib/
        ├── prisma.ts            # PrismaClient singleton (MariaDB adapter)
        ├── services/
        │   ├── jwt.service.ts   # sign/verify/rotate/revoke JWT tokens
        │   └── otp.service.ts   # generate/verify 6-digit OTP
        ├── types/
        │   ├── auth.types.ts
        │   ├── portfolio.types.ts
        │   ├── skill.types.ts
        │   └── globle.types.ts  # ApiResponse shape
        ├── validators/
        │   └── skill.validation.ts   # Zod schemas for Skill create/update
        └── utills/
            ├── send.ts              # res.status().json() wrapper
            ├── catch-error.ts       # Global 500 handler
            ├── redis.ts             # ioredis singleton + cache config
            ├── cloudinary.ts        # upload / delete helpers
            ├── mailer.ts            # Nodemailer OTP + contact emails
            └── caching/
                ├── cache.ts              # Public cache API (cacheRemember, etc.)
                ├── cache.circuit.ts      # Circuit breaker (CLOSED/OPEN/HALF_OPEN)
                ├── cache.lock.ts         # Redis distributed lock with backoff
                ├── cache.etag.ts         # SHA-256 ETag generation & matching
                ├── cache.serializer.ts   # JSON serialize / gzip compress
                ├── cache.keys.ts         # Key/lock-key builders
                ├── cache.constants.ts    # TTL presets, thresholds
                ├── cache.types.ts        # TypeScript interfaces
                └── cache.collections.ts  # (reserved for collection helpers)
```

---

## 2. Entry Points

### `src/server.ts`

The bare HTTP listener. Reads `config.port` (default `5000`), calls `app.listen()`, and logs startup.

```
getConfig() → config.port → app.listen(PORT)
```

### `src/app.ts`

Builds and exports the Express application. Runs once on import:

1. **CORS** — builds an `allowedOrigins` set from:
   - `CORS_ORIGINS` env list (if set), or
   - dev defaults (`localhost:3000`, `localhost:5173`), or
   - `CLIENT_URL` in production.
   - Non-browser clients (no `Origin` header) are always allowed.
   - Exposes the `ETag` header so clients can do conditional requests.
2. **Body parsers** — `express.json()`, `cookie-parser`, `express.urlencoded()`.
3. **Router** — all routes mounted at `/api`.
4. **Health check** — `GET /` returns `{ status: "OK" }`.

Also imports `redis.ts` as a side-effect, which connects ioredis and configures the cache system.

---

## 3. Configuration — `env.ts`

`getConfig()` is called on every request (lazy, but memoised after first init via `initialized` flag). It loads `.env.<NODE_ENV>` via dotenv and returns a typed config object.

| Config key | Source env var | Default |
|---|---|---|
| `isDev` | `NODE_ENV !== 'production'` | `true` |
| `port` | `PORT` | `5000` |
| `db.host/port/user/password/database` | `DATABASE_*` | — |
| `redis.url/host/port` | `REDIS_*` | `redis://localhost:6379` |
| `rateLimit.bypass` | `RATE_LIMIT_BYPASS=true` | `false` |
| `cors.originList` | `CORS_ORIGINS` (comma-sep) | `[]` |
| `client.url` | `CLIENT_URL` | — |
| `mailer.*` | `SMTP_*`, `SEED_ADMIN_EMAIL` | — |
| `admin.*` | `SEED_ADMIN_*` | — |
| `jwt.accessSecret/refreshSecret` | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | — |
| `cloudinary.*` | `CLOUDINARY_*` | — |

---

## 4. Database Schema — Prisma

Database: **MySQL / MariaDB**. Generated client output: `generated/prisma/`.

### `Admin`
Stores the single admin user created by the seed script.

| Column | Type | Notes |
|---|---|---|
| `id` | `String` CUID | PK |
| `email` | `String` | Unique |
| `password_hash` | `String` | bcrypt |
| `full_name` | `String` | |
| `is_active` | `Boolean` | `true` by default |
| `created_at` | `DateTime` | auto |
| `updated_at` | `DateTime` | auto |

Relations: `otpTokens OtpToken[]`, `refreshTokens RefreshToken[]`

### `OtpToken`
Stores bcrypt-hashed one-time passwords. Each login generates a new OTP; existing unused/unexpired OTPs are force-expired first.

| Column | Type | Notes |
|---|---|---|
| `id` | CUID | PK |
| `admin_id` | FK → Admin | cascade delete |
| `code_hash` | `String` | bcrypt of 6-digit code |
| `expires_at` | `DateTime` | 5 minutes after creation |
| `used_at` | `DateTime?` | set when consumed |
| `created_at` | `DateTime` | auto |

### `RefreshToken`
Each device/session gets one row. Tokens are rotated (old revoked, new issued) on every `/refresh` call.

| Column | Type | Notes |
|---|---|---|
| `id` | CUID | PK, also used as JWT `jti` |
| `admin_id` | FK → Admin | cascade delete |
| `token_hash` | `String` | SHA-256 of the raw JWT |
| `expires_at` | `DateTime` | 7 days |
| `revoked_at` | `DateTime?` | set on logout / rotation |
| `created_at` | `DateTime` | auto |

### `Skill`
Represents a technology/skill shown on the portfolio. Two modes: `code` (shows a code snippet) or `terminal` (shows a terminal session).

| Column | Type | Notes |
|---|---|---|
| `id` | CUID | PK |
| `name` | `String` | Display name |
| `icon` | `String` | Icon identifier |
| `file_name` | `String` | Source file label |
| `lang` | `String` | **Unique** — language key |
| `color` | `String` | Hex/CSS color |
| `mode` | `SkillMode` enum | `code` or `terminal` |
| `code` | `Json?` | `string[]` — code lines. Present only when `mode=code` |
| `commands` | `Json?` | `TerminalLine[]` — Present only when `mode=terminal` |
| `created_at` / `updated_at` | `DateTime` | auto |

`SkillMode` enum values: `code`, `terminal`

### `Portfolio_item`
A portfolio project entry. Table name: `portfolio_items`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `site_name` | `String` | |
| `site_role` | `String` | Role played on this project |
| `site_url` | `String` | Valid URL required |
| `site_image_url` | `String` | Cloudinary URL |
| `use_tech` | `Json` | `string[]` — tech stack |
| `description` | `String` | |
| `created_at` / `updated_at` | `DateTime` | auto |

### `ContactMessage`
Stores contact form submissions. Table name: `contact_messages`.

| Column | Type | Notes |
|---|---|---|
| `id` | CUID | PK |
| `full_name` | `String` | |
| `email` | `String` | |
| `message` | `String` | |
| `is_read` | `Boolean` | `false` default |
| `created_at` | `DateTime` | auto |

---

## 5. Routes Overview

```
POST   /api/auth/login          Public    — step 1: credentials → OTP email
POST   /api/auth/verify-otp     Public    — step 2: OTP → JWT pair
POST   /api/auth/refresh        Public    — rotate refresh token → new JWT pair
POST   /api/auth/logout         Public    — revoke current session
POST   /api/auth/logout-all     Protected — revoke all sessions for this admin
GET    /api/auth/me             Protected — return admin profile

GET    /api/skills              Public    — list all skills (optional ?mode=code|terminal)
GET    /api/skills/:id          Public    — get single skill
POST   /api/skills              Protected — create skill
PATCH  /api/skills/:id          Protected — update skill (requires If-Match ETag)
DELETE /api/skills/:id          Protected — delete skill

GET    /api/portfolio           Public    — list all portfolio items
GET    /api/portfolio/:id       Public    — get single portfolio item
POST   /api/portfolio           Protected — create portfolio item
PATCH  /api/portfolio/:id       Protected — update portfolio item (requires If-Match ETag)
DELETE /api/portfolio/:id       Protected — delete portfolio item

POST   /api/contact             Public    — submit contact form
GET    /api/contact             Protected — list messages (paginated)
DELETE /api/contact/:id         Protected — delete a message
```

---

## 6. Authentication (`/api/auth`)

### How Two-Step Auth Works

```
Client                          Server
  |                                |
  |──POST /auth/login ────────────▶|  1. Verify email+password (bcrypt)
  |                                |  2. generateOtp() → 6-digit code stored as bcrypt hash
  |                                |  3. sendOtpEmail() → SMTP email to admin
  |◀─ 200 { email } ──────────────|
  |                                |
  |──POST /auth/verify-otp ───────▶|  4. verifyOtp() → bcrypt.compare, mark usedAt
  |                                |  5. signAccessToken() → JWT (15 min, in response body)
  |                                |  6. signRefreshToken() → JWT (7 days, HttpOnly cookie)
  |◀─ 200 { accessToken } ────────|  cookie: Set-Cookie: refreshToken=...; HttpOnly
  |                                |
  |──GET /api/* (Bearer token) ───▶|  7. requireAdmin middleware verifies access JWT
  |◀─ 200 data ───────────────────|
  |                                |
  |──POST /auth/refresh ──────────▶|  8. Reads cookie, rotateRefreshToken()
  |◀─ 200 { accessToken } ────────|  New cookie issued, old revoked
```

---

### `POST /api/auth/login`

**Purpose:** Step 1 — validates credentials and sends OTP email.

**Rate limit:** 5 req / 10 min (weight 2), 20 req / 1 hr · `failBehavior: 'closed'`

**Request body:**
```json
{ "email": "admin@example.com", "password": "secret" }
```

**Function: `login(req, res)`** — `auth.controller.ts`

1. Validates `email` and `password` are present → 400 if missing.
2. Queries `Admin` by email (lowercase + trimmed). Selects `id, email, fullName, passwordHash, isActive`.
3. **Timing-attack protection:** even if admin not found, runs `bcrypt.compare` against a dummy hash so response time is constant whether or not the email exists.
4. If admin not found, password wrong, or `isActive=false` → `401 Invalid credentials`.
5. Calls `generateOtp(admin.id)`:
   - Force-expires all current unused OTPs for this admin.
   - Generates `crypto.randomInt(0, 10^6).toString().padStart(6, '0')`.
   - Hashes with bcrypt (12 rounds), stores in `otp_token` table.
   - Returns plain OTP.
6. Calls `sendOtpEmail(email, fullName, otpCode)` via SMTP.
7. Returns `200 { email }`.

**Success response:**
```json
{ "success": true, "status": 200, "message": "OTP sent to your registered email", "data": { "email": "admin@example.com" } }
```

---

### `POST /api/auth/verify-otp`

**Purpose:** Step 2 — validates OTP and issues JWT pair.

**Rate limit:** 5 req / 5 min, 10 req / 30 min · `failBehavior: 'closed'`

**Request body:**
```json
{ "email": "admin@example.com", "otp": "123456" }
```

**Function: `verifyOtpHandler(req, res)`**

1. Validates fields present.
2. Looks up Admin by email.
3. Calls `verifyOtp(admin.id, otp)`:
   - Finds latest `OtpToken` where `adminId=id, usedAt=null, expiresAt > now`.
   - `bcrypt.compare(otpCode, record.codeHash)`.
   - If match, sets `usedAt = now` (one-time use).
4. Calls `signAccessToken(admin.id, admin.email)` → JWT signed with `JWT_ACCESS_SECRET`, expires `15m`, payload: `{ sub, email, type: 'access' }`.
5. Calls `signRefreshToken(admin.id)`:
   - Creates DB row in `refresh_token` with placeholder hash.
   - Signs JWT with `JWT_REFRESH_SECRET`, `jti = record.id`, expires 7 days.
   - Updates DB row with `sha256(token)` hash.
6. Sets HttpOnly cookie `refreshToken` (7 days, `secure` in production, `sameSite: strict`).
7. Returns `accessToken` in JSON body.

**Success response:**
```json
{
  "success": true, "status": 200, "message": "Login successful",
  "data": { "accessToken": "eyJ...", "tokenType": "Bearer", "expiresIn": 900 }
}
```

---

### `POST /api/auth/refresh`

**Purpose:** Silently rotate the refresh token and get a new access token.

**Rate limit:** 10 req / 5 min, 20 req / 30 min · `failBehavior: 'closed'`

**No request body.** Reads `refreshToken` HttpOnly cookie automatically.

**Function: `refresh(req, res)`**

1. Reads `req.cookies.refreshToken`. Returns `401` if missing.
2. Calls `rotateRefreshToken(oldToken)`:
   - `jwt.verify(oldToken, REFRESH_SECRET)` to get payload `{ sub, jti }`.
   - Computes `sha256(oldToken)`.
   - Looks up DB row: `id=jti, adminId=sub, tokenHash=hash, revokedAt=null, expiresAt > now`, includes `admin.email` and `admin.isActive`.
   - Returns `null` if not found or admin inactive.
   - Sets `revokedAt = now` on the old token.
   - Signs new access + refresh tokens.
3. Sets new cookie, returns new `accessToken`.

---

### `POST /api/auth/logout`

**Purpose:** Revoke the current session.

**No rate limit.** Reads `refreshToken` cookie.

**Function: `logout(req, res)`**

1. If cookie present, calls `revokeRefreshToken(token)`:
   - Verifies JWT, computes hash, sets `revokedAt` on matching DB row.
2. Clears the cookie.
3. Returns `200 Logged out successfully`.

---

### `POST /api/auth/logout-all` *(Protected)*

**Purpose:** Revoke ALL sessions for the current admin.

**Function: `logoutAll(req, res)`**

Calls `revokeAllRefreshTokens(admin.id)`:
- `prisma.refreshToken.updateMany({ where: { adminId, revokedAt: null }, data: { revokedAt: now } })`.

Clears cookie, returns `200 All sessions revoked`.

---

### `GET /api/auth/me` *(Protected)*

**Purpose:** Return the logged-in admin's profile.

**Function: `me(req, res)`**

Queries Admin by `req.admin.id`. Returns `{ id, email, fullName, createdAt, role: 'admin' }`.

---

## 7. Skills (`/api/skills`)

### `GET /api/skills`

**Rate limit:** 2 req / 5 min, 10 req / 30 min

**Query params:** `?mode=code` or `?mode=terminal` (optional filter)

**Function: `getAll(req, res)`** — `skill.controller.ts`

1. Reads `If-None-Match` header for 304 support.
2. Calls `cacheRememberConditional(CACHE_KEYS.all(mode), { ttl: ONE_DAY, staleTtl: ONE_WEEK, ifNoneMatch })`.
   - Cache key: `skills:list:all` or `skills:list:code` or `skills:list:terminal`.
   - On miss: `prisma.skill.findMany({ where: mode ? { mode } : undefined, orderBy: { created_at: 'asc' } })`.
3. Sets `ETag` and `Cache-Control: private, must-revalidate` headers.
4. Returns `304` if ETag matches, else `200` with `data: SkillResponse[]` + `meta: { total }`.

**Response shape `SkillResponse`:**
```json
{
  "id": "...", "name": "TypeScript", "icon": "ts", "fileName": "index.ts",
  "lang": "typescript", "color": "#3178c6", "mode": "code",
  "code": ["const x: number = 1;", "console.log(x);"],
  "commands": null,
  "createdAt": "2026-04-19T00:00:00.000Z",
  "updatedAt": "2026-04-19T00:00:00.000Z"
}
```

---

### `GET /api/skills/:id`

**Rate limit:** 2 req / 5 min, 10 req / 30 min

**Function: `getOne(req, res)`**

Same pattern as `getAll` but for a single item. Cache key: `skills:{id}`. Returns `404` if not found.

---

### `POST /api/skills` *(Protected)*

**Rate limit:** 10 req / 10 min, 25 req / 30 min

**Function: `create(req, res)`**

1. Validates body with `createSkillSchema` (Zod discriminated union on `mode`). Returns `400` with issue details on failure.
2. Creates DB row via `prisma.skill.create()`.
   - If `mode=code`, stores `code` JSON, sets `commands=JsonNull`.
   - If `mode=terminal`, stores `commands` JSON, sets `code=JsonNull`.
3. Calls `cachePut(CACHE_KEYS.one(row.id), row, ONE_DAY)` to warm the new item immediately.
4. Calls `cacheInvalidatePrefix('skills')` to bust list caches.
5. Sets `ETag` header.
6. Returns `201` with `SkillResponse`.

**Unique constraint:** `lang` is unique. Prisma error `P2002` on `lang` field → `409 A skill with this language already exists`.

**Request body (mode=code example):**
```json
{
  "name": "TypeScript", "icon": "ts", "fileName": "index.ts",
  "lang": "typescript", "color": "#3178c6",
  "mode": "code",
  "code": ["const x: number = 1;"]
}
```

---

### `PATCH /api/skills/:id` *(Protected)*

**Rate limit:** same as POST

**Requires `If-Match` header** (optimistic locking — prevents concurrent overwrites).

**Function: `update(req, res)`**

1. Returns `428 If-Match header required` if header missing.
2. Calls `cacheRememberConditional(CACHE_KEYS.one(id), { ifMatch: clientETag })`:
   - Returns `status: 412` if current ETag ≠ `If-Match` value → `412 Resource modified by another request`.
3. Returns `404` if skill not found.
4. Validates body with `updateSkillSchema` (all fields optional).
5. Resolves merged fields: `input.field ?? cached.data.field`.
6. Resolves `code`/`commands` based on resolved mode (null-out the unused field).
7. Updates DB row.
8. `cachePut` single item, `cacheInvalidatePrefix` list.
9. Sets new `ETag` header, returns `200` with updated `SkillResponse`.

---

### `DELETE /api/skills/:id` *(Protected)*

**Function: `remove(req, res)`**

1. `cacheRemember` to check existence (hits Redis before DB).
2. Returns `404` if not found.
3. `prisma.skill.delete()`.
4. `cacheForget(CACHE_KEYS.one(id))` + `cacheInvalidatePrefix('skills')` in parallel.
5. Returns `200 Skill deleted successfully`.

---

## 8. Portfolio (`/api/portfolio`)

### `GET /api/portfolio`

**Rate limit:** 5 req / 5 min, 20 req / 30 min

**Function: `getAllPortfolioItems(req, res)`** — `portfolio.controller.ts`

1. Reads `If-None-Match` header.
2. `cacheRememberConditional('portfolio:list', { ttl: ONE_DAY, staleTtl: ONE_WEEK, ifNoneMatch })`.
3. On miss: `prisma.portfolio_item.findMany({ orderBy: { created_at: 'desc' } })`.
4. Sets `ETag`, `Cache-Control: private, must-revalidate`.
5. Returns `304` or `200` with raw Prisma rows (not mapped through `toPortfolioResponse` for the list — returns raw `Portfolio_item[]`).

---

### `GET /api/portfolio/:id`

**Rate limit:** 5 req / 5 min, 20 req / 30 min

**Function: `getPortfolioItemById(req, res)`**

Same conditional cache pattern. Maps result through `toPortfolioResponse()`:

```
Portfolio_item (snake_case DB row)
  ↓ toPortfolioResponse()
PortfolioItem (camelCase API shape)
  { id, siteName, siteRole, siteUrl, siteImageUrl, useTech, description, createdAt, updatedAt }
```

Validates that `use_tech` is actually `string[]` (type guard `isStringArray()`). Returns `404` if not found.

---

### `POST /api/portfolio` *(Protected)*

**Rate limit:** 10 req / 10 min, 25 req / 30 min

**Function: `createPortfolioItem(req, res)`**

1. Validates body with `validateCreate()`:
   - `site_name`, `site_role`, `site_url` (valid URL), `site_image_url` (valid URL), `description` required.
   - `use_tech` must be a non-empty `string[]`.
   - On validation failure: calls `deleteFromCloudinary(req.body.site_image_url)` to clean up the already-uploaded image. Returns `400`.
2. Creates DB row.
3. **Cache order (important):** invalidate list FIRST, then warm single item. (Reverse order would have `cacheInvalidatePrefix` wipe the freshly written item.)
4. Sets `ETag` header, returns `201`.

**On any unhandled error:** also calls `deleteFromCloudinary` in catch block.

---

### `PATCH /api/portfolio/:id` *(Protected)*

**Requires `If-Match` header.**

**Function: `updatePortfolioItem(req, res)`**

1. Returns `428` if no `If-Match`.
2. `cacheRememberConditional` with `ifMatch` → `412` on ETag mismatch.
3. `404` if not found.
4. `validateUpdate()` — partial validation (only checks fields that are present).
5. If `site_image_url` changed: after DB update, calls `deleteFromCloudinary(existing.site_image_url)` to remove the old image.
6. Cache: invalidate list first, then `cachePut` updated item.
7. Returns `200` mapped through `toPortfolioResponse()`.

**On error:** tries to `deleteFromCloudinary(newImage)` in catch block.

---

### `DELETE /api/portfolio/:id` *(Protected)*

**Function: `deletePortfolioItem(req, res)`**

1. `cacheRemember` for existence check (only `select: { id: true }` — lightweight).
2. `prisma.portfolio_item.delete()` — returns the deleted full record.
3. If deleted record has `site_image_url`, calls `deleteFromCloudinary()`.
4. `cacheForget` + `cacheInvalidatePrefix` in parallel.
5. Returns `200`.

---

## 9. Contact (`/api/contact`)

### `POST /api/contact`

**Rate limit:** 2 req / 5 min, 8 req / 30 min · `failBehavior: 'open'`

**Middleware:** `validateContact` runs before controller.

**Function: `submitContact(req, res)`** — `contact.controller.ts`

1. Creates `ContactMessage` row via `prisma.contactMessage.create()`.
2. `cacheInvalidatePrefix('contacts')` — busts admin list cache.
3. **Fire-and-forget email:** calls `sendContactEmail(fullName, email, message, entry.created_at)` without `await`. Errors are caught and logged but don't affect the response.
4. Returns `201 { id: entry.id }`.

---

### `GET /api/contact` *(Protected)*

**Rate limit:** 10 req / 10 min, 25 req / 30 min

**Function: `getContacts(req, res)`**

1. Parses `?page` (min 1) and `?pageSize` (max 50, default 20) from query string.
2. Reads `If-None-Match` header.
3. `cacheRememberConditional(contacts:list:{page}:{pageSize}, { ttl: ONE_DAY, staleTtl: ONE_WEEK, ifNoneMatch })`.
4. On miss: `Promise.all([findMany(skip/take/orderBy desc), count()])`.
5. Returns `304` or `200` with:
```json
{
  "data": [...],
  "meta": { "total": 42, "page": 1, "pageSize": 20, "totalPages": 3 }
}
```

---

### `DELETE /api/contact/:id` *(Protected)*

**Function: `deleteContact(req, res)`**

1. `cacheRemember(contact:{id})` for existence check (selects `{ id: true }`).
2. Returns `404` if not found.
3. `prisma.contactMessage.delete()`.
4. `cacheForget(contact:{id})` + `cacheInvalidatePrefix('contacts')` in parallel.
5. Returns `200 Deleted successfully`.

---

## 10. Middlewares

### `requireAdmin` — `auth.middleware.ts`

Protects any route that requires a valid JWT access token.

```
Authorization: Bearer <accessToken>
```

1. Checks header starts with `Bearer `.
2. Slices the token, calls `verifyAccessToken(token)` (jwt.verify against `JWT_ACCESS_SECRET`).
3. Checks `payload.type === 'access'` (rejects refresh tokens used as access tokens).
4. Attaches `req.admin = { id: payload.sub, email: payload.email }`.
5. Calls `next()`.
6. On `TokenExpiredError` → `401 Access token expired`.
7. On any other error → `401 Invalid access token`.

---

### `validateContact` — `contact.middleware.ts`

Runs before `submitContact`. Validates and sanitises the contact form body.

| Field | Rules |
|---|---|
| `fullName` | string, min 2 chars |
| `email` | string, matches `[^@]+@[^@]+\.[^@]+` |
| `message` | string, min 10 chars |

On failure: returns `400 { success: false, error: { fieldName: "error message" } }`.

On success: trims `fullName` and `message`, lowercases `email`, calls `next()`.

---

### `rateLimit()` — `rate-limit/`

Factory middleware using a **Redis sliding-window algorithm** (Lua script).

**Config shape:**
```ts
{
  action: string;      // logical name, used in Redis key
  tiers: Tier[];       // one or more { limit, interval, weight? }
  message?: string;
  failBehavior?: 'open' | 'closed';  // default 'open'
  keyResolver?: (req) => string;     // custom identity key
  skip?: (req) => boolean;           // skip condition
}
```

**How it works:**

1. In dev with `RATE_LIMIT_BYPASS=true` → always `next()`.
2. Resolves `identity` = IP from `X-Forwarded-For` or `req.socket.remoteAddress`.
3. For each tier, runs `SLIDING_WINDOW_SCRIPT` via `redis.eval()`:
   - Lua script operates on a Redis sorted set keyed as `rl:{<identity>}:<action>:<interval>`.
   - Hash tag `{identity}` ensures Redis Cluster compatibility.
   - Returns `[count, oldestScore]`.
4. If any tier's `count > limit` → `429` with `retryAfter` seconds.
5. Tracks the most-restrictive tier for response headers (IETF draft format):
   - `RateLimit-Policy`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After`.
6. **On Redis failure:**
   - `failBehavior: 'closed'` → `503 Service temporarily unavailable`.
   - `failBehavior: 'open'` → falls back to in-memory sliding window (`rate-limit.fallback.ts`), then either blocks or allows.

**`rate-limit.fallback.ts`:** An in-memory `Map<key, { count, windowStart }>`. Resets count when the window has passed. Used only when Redis is unreachable.

---

## 11. Services

### `jwt.service.ts`

#### `signAccessToken(adminId, email): string`
Signs a JWT with `{ sub: adminId, email, type: 'access' }`. Expires in `15m`. Uses `JWT_ACCESS_SECRET`.

#### `signRefreshToken(adminId): Promise<string>`
1. Creates a `RefreshToken` DB row with placeholder hash to get the row `id` (used as `jti`).
2. Signs JWT with `{ sub: adminId, jti: record.id, type: 'refresh' }`. Expires 7 days.
3. Computes `sha256(token)`, updates DB row.
4. Returns raw JWT (stored only in cookie, never DB).

#### `verifyAccessToken(token): AccessTokenPayload`
`jwt.verify(token, ACCESS_SECRET)` — throws on invalid/expired.

#### `rotateRefreshToken(oldToken): Promise<{accessToken, refreshToken} | null>`
1. Verifies old token, extracts `{ sub, jti }`.
2. Looks up DB record matching `id=jti, adminId=sub, hash, revokedAt=null, expiresAt > now`.
3. Marks old record `revokedAt = now`.
4. Issues new access + refresh token pair.
5. Returns `null` on any failure.

#### `revokeRefreshToken(token): Promise<void>`
Marks a single session as revoked.

#### `revokeAllRefreshTokens(adminId): Promise<void>`
Marks all active sessions for an admin as revoked.

---

### `otp.service.ts`

#### `generateOtp(adminId): Promise<string>`
1. Force-expires all active OTPs for the admin.
2. `crypto.randomInt(0, 10^6).toString().padStart(6, '0')` — cryptographically secure.
3. `bcrypt.hash(otpCode, 12)` — stored in DB.
4. Returns plain OTP (sent via email, never stored in plain text).

#### `verifyOtp(adminId, otpCode): Promise<boolean>`
1. Finds the latest active (unused, unexpired) OTP for the admin.
2. `bcrypt.compare(otpCode, record.codeHash)`.
3. On match: sets `usedAt = now` (one-time use enforcement).
4. Returns `true` or `false`.

---

## 12. Caching System

The caching system lives in `src/lib/utills/caching/`. It wraps Redis with:
- **Stale-while-revalidate** (SWR) pattern
- **Conditional requests** (ETag / If-None-Match / If-Match)
- **Distributed locking** (prevents cache stampede)
- **Circuit breaker** (degrades gracefully when Redis is down)
- **Optional compression** (gzip for payloads > 1KB)

### Cache Payload

Every value stored in Redis is wrapped in a `CachePayload<T>`:
```ts
{
  data: T;
  expiry: number;       // Unix timestamp ms — when fresh TTL expires
  etag: string;         // SHA-256 of JSON.stringify(data), base64url, 16 chars
  lastModified: number; // Unix timestamp ms
}
```
Redis TTL is set to `ttl + staleTtl` seconds, so stale data stays in Redis past the fresh window.

---

### `cacheRemember<T>(key, options)`

Simple cache-or-compute. Returns `T` directly.

```
Read from Redis
  ├── HIT (fresh): return data
  ├── HIT (stale, staleTtl > 0): trigger background revalidation, return stale data
  └── MISS / corrupt:
        Acquire distributed lock (backoff)
          ├── Acquired: double-check cache, compute, write, release lock
          └── Not acquired: wait 100ms, retry read, fallback to direct compute
```

---

### `cacheRememberConditional<T>(key, options)`

Extended version that supports HTTP conditional semantics. Returns `CacheResult<T>`.

```ts
{
  data?: T;
  etag: string;
  status: 200 | 304 | 412;
  hit: boolean;
  stale: boolean;
}
```

- **`ifNoneMatch`** (from `If-None-Match` header): if ETag matches cached → `status: 304`
- **`ifMatch`** (from `If-Match` header): if ETag does NOT match cached → `status: 412`

---

### `cachePut<T>(key, value, ttl)`

Direct write to cache. Used after create/update to warm the cache immediately (avoids cold miss).

---

### `cacheForget(key)`

Delete a single key from Redis.

---

### `cacheInvalidatePrefix(prefix)`

Uses Redis `SCAN` (batches of 100) to find all keys matching `app:cache:{prefix}:*` and deletes them using a pipeline. Returns the count of deleted keys.

---

### Key Format

```
app:cache:{key}          →  e.g. app:cache:skills:list:all
app:cache:{key}:lock     →  distributed lock for stampede prevention
```

`buildKey(key)` → `app:cache:{key}`
`buildLockKey(redisKey)` → `{redisKey}:lock`

---

### Circuit Breaker — `cache.circuit.ts`

Three states: `CLOSED` (normal) → `OPEN` (Redis broken) → `HALF_OPEN` (probing).

| Function | Behaviour |
|---|---|
| `recordSuccess()` | Resets failures, transitions to CLOSED |
| `recordFailure(err, context)` | Adds timestamp to failure window. After 3 failures in 30s → OPEN |
| `isCircuitOpen()` | Returns `true` if OPEN. After 30s recovery window → transitions to HALF_OPEN (returns `false` to allow one probe) |
| `getCircuitState()` | Returns current state string |

When `isCircuitOpen()` is `true`, all cache functions bypass Redis and call the DB callback directly.

---

### Distributed Lock — `cache.lock.ts`

Uses Redis `SET key 1 EX 5 NX` (atomic set-if-not-exists, 5s TTL).

#### `acquireLock(lockKey): Promise<boolean>`
Single attempt. Returns `true` if acquired.

#### `acquireLockWithBackoff(lockKey, maxRetries=3): Promise<boolean>`
Retries up to 3 times with exponential backoff + jitter: `min(100 * 2^attempt, 1000) + random(100)ms`.

#### `releaseLock(lockKey): Promise<void>`
Deletes the lock key (best-effort, swallows errors).

---

### ETag — `cache.etag.ts`

#### `generateETag(data, weak?): string`
`sha256(JSON.stringify(data))` → base64url → first 16 chars → `"<hash>"` or `W/"<hash>"`.

#### `matchETag(clientETag, serverETag): boolean`
Normalises both sides (strips `W/`, quotes, trims), splits `clientETag` by comma (multi-value support), returns `true` if any matches `serverETag`. `clientETag === '*'` always matches.

#### `generateCompositeETag(etags[]): string`
Sorts and combines multiple ETags for collection responses (weak ETag).

---

### Serializer — `cache.serializer.ts`

#### `serialize<T>(payload, enableCompression?): Promise<SerializationResult>`
1. `JSON.stringify(payload)`.
2. Rejects if > 1MB.
3. If compression enabled and size > 1KB: gzip + base64 encode.
4. Returns `{ data: string, compressed: boolean, originalSize: number }`.

#### `deserialize<T>(raw, compressed?): Promise<CachePayload<T>>`
1. If compressed: base64 decode → gunzip.
2. `JSON.parse(json, reviver)` — reviver converts ISO date strings to `Date` objects.

Detection: if the raw string starts with `{` it's plain JSON; otherwise compressed.

---

## 13. Utilities

### `send.ts` — `send<T>(res, payload)`
```ts
res.status(payload.status).json(payload)
```
Wrapper that ensures every response is a typed `ApiResponse<T>`.

---

### `catch-error.ts` — `catchError(res, err)`
Global 500 handler used in every controller's catch block.
- Logs `err` to console.
- Returns `500 Internal server error`.
- In dev (`isDev=true`): includes `{ name, detail }` in the `error` field.
- In production: `error` field is omitted.

---

### `redis.ts`

Creates an `ioredis` singleton using `REDIS_HOST` / `REDIS_PORT` env vars.

Also runs on import as a side-effect:
- Calls `configureCache({ failureThreshold: 5, recoveryWindowMs: 60_000, enableCompression: true, maxCallbackDurationMs: 10_000 })`.
- Calls `setCacheMetrics(...)` with console.log-based metric logging.

---

### `cloudinary.ts`

Configures Cloudinary SDK once with `CLOUDINARY_*` env vars.

#### `uploadToCloudinary(file, folder?): Promise<{ public_id, url }>`
Uploads a file. `resource_type: 'auto'` supports images and videos.

#### `extractPublicId(url): string | null`
Parses a Cloudinary URL to extract `folder/filename` (without extension).

#### `deleteFromCloudinary(publicId): Promise<any>`
1. Calls `extractPublicId()` to normalise.
2. `cloudinary.uploader.destroy(publicId)`.
3. Throws `'Cloudinary delete failed'` on error.

Called defensively on validation failure and errors in portfolio create/update to prevent orphaned images.

---

### `mailer.ts`

Nodemailer transporter configured from `SMTP_*` env vars.

#### `verifyMailer(): Promise<void>`
Tests SMTP connection. Called on startup.

#### `sendOtpEmail(toEmail, fullName, otpCode): Promise<void>`
Sends a styled HTML email with the 6-digit OTP. From: `"Admin Portal" <SMTP_FROM>`. Subject: `Your Admin Login OTP`.

#### `sendContactEmail(fullName, email, message, createdAt): Promise<void>`
Sends contact form submission to admin. From: `"Portfolio Contact" <SMTP_FROM>`. To: `SEED_ADMIN_EMAIL`. `Reply-To: <sender email>`.

---

## 14. Types

### `ApiResponse<T>` — `globle.types.ts`
```ts
{
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: unknown;
  meta?: Record<string, unknown>;
}
```

### `AuthRequest` — `auth.types.ts`
Extends `express.Request` with `admin?: { id: string; email: string }` attached by `requireAdmin`.

### `AccessTokenPayload`
```ts
{ sub: string; email: string; type: 'access' }
```

### `RefreshTokenPayload`
```ts
{ sub: string; jti: string; type: 'refresh' }
```

### `PortfolioItem` (API response shape)
```ts
{ id, siteName, siteRole, siteUrl, siteImageUrl, useTech: string[], description, createdAt, updatedAt }
```

### `SkillRow` (raw DB row)
```ts
{ id, name, icon, file_name, lang, color, mode: 'code'|'terminal', code: string[]|null, commands: TerminalLine[]|null, created_at, updated_at }
```

### `SkillResponse` (API response)
Same as `SkillRow` but camelCase, dates as ISO strings.

### `TerminalLine`
Discriminated union:
```ts
| { kind: 'command'; text: string }
| { kind: 'output';  text: string }
| { kind: 'comment'; text: string }
| { kind: 'blank' }
```

---

## 15. Validators

### `createSkillSchema` (Zod) — `skill.validation.ts`

Discriminated union on `mode`:

**mode = `'code'`** requires: `name, icon, fileName, lang, color, mode='code', code: string[]` (min 1). `commands` must be null/undefined.

**mode = `'terminal'`** requires: `name, icon, fileName, lang, color, mode='terminal', commands: TerminalLine[]` (min 1). `code` must be null/undefined.

### `updateSkillSchema` (Zod)

All fields optional. Uses `.superRefine()` to enforce:
- If `mode='code'` → `commands` must be null.
- If `mode='terminal'` → `code` must be null.

---

## 16. Data Flow Diagrams

### Full Auth Flow

```
[Client]
   │
   ├─POST /auth/login { email, password }
   │     │
   │     ├─ bcrypt.compare (constant-time)
   │     ├─ generateOtp() → crypto.randomInt → bcrypt.hash → DB insert
   │     └─ sendOtpEmail() → SMTP → admin inbox
   │
   │◀─ 200 { email }
   │
   ├─POST /auth/verify-otp { email, otp }
   │     │
   │     ├─ verifyOtp() → DB lookup → bcrypt.compare → DB update usedAt
   │     ├─ signAccessToken() → JWT (15min, in-memory)
   │     └─ signRefreshToken() → DB create (jti) → JWT (7d) → sha256 → DB update
   │
   │◀─ 200 { accessToken } + Set-Cookie: refreshToken=...; HttpOnly
   │
   ├─GET /api/* { Authorization: Bearer <accessToken> }
   │     │
   │     └─ requireAdmin → jwt.verify → req.admin = { id, email }
   │
   │◀─ 200 data
   │
   ├─POST /auth/refresh  (cookie auto-sent)
   │     │
   │     └─ rotateRefreshToken() → verify → DB lookup → revoke old → sign new pair
   │
   │◀─ 200 { accessToken } + new cookie
```

---

### Cache Read Flow (`cacheRemember`)

```
Request arrives
     │
     ▼
isCircuitOpen?
  YES → bypass Redis, call DB callback directly
  NO  ▼
     │
Read from Redis (app:cache:{key})
     │
     ├── HIT (expiry > now) ──────────────────────── return data
     │
     ├── HIT (stale, staleTtl > 0)
     │     └── trigger background revalidation ────── return stale data
     │           (acquireLock, callback, writeToCache)
     │
     └── MISS / corrupt
           │
           acquireLockWithBackoff (3 retries, exp backoff)
           │
           ├── Acquired:
           │     double-check Redis (another worker may have filled it)
           │     call callback() with timeout
           │     writeToCache (fire-and-forget)
           │     releaseLock
           │     return data
           │
           └── Not acquired (lock contention):
                 sleep 100ms
                 retry read
                 fallback: call callback() directly
```

---

### Write-Through Cache Pattern (Create/Update)

```
POST/PATCH request
     │
     ├── DB write (create/update)
     │
     ├── cacheInvalidatePrefix(prefix)   ← bust all list caches first
     │     SCAN app:cache:{prefix}:* → pipeline DEL
     │
     └── cachePut(key, data, ttl)        ← warm single-item cache
           writeToCache → Redis SET EX
```

---

## 17. Error Handling

### Standard error responses

All errors pass through `catchError(res, err)` or are explicitly constructed:

| Status | When |
|---|---|
| `400` | Validation failure (missing fields, bad URL, Zod error) |
| `401` | Wrong credentials, invalid/expired token, revoked session |
| `404` | Resource not found |
| `409` | Unique constraint violation (Skill `lang` field) |
| `412` | ETag mismatch on `If-Match` (concurrent modification) |
| `428` | `If-Match` header required but missing |
| `429` | Rate limit exceeded |
| `500` | Unhandled exception (details only in dev) |
| `503` | Redis failure with `failBehavior: 'closed'` |

### Prisma error P2002

Caught in `skill.controller.ts` with `isLangTaken(err)`:
```ts
err instanceof Prisma.PrismaClientKnownRequestError
  && err.code === 'P2002'
  && err.meta.target.includes('lang')
```
→ returns `409` with field detail.

---

## 18. Environment Variables Reference

```env
# Server
NODE_ENV=development
PORT=5000

# Database (MariaDB)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=secret
DATABASE_NAME=portfolio

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CLIENT_URL=https://myportfolio.com

# Rate Limiting
RATE_LIMIT_BYPASS=true          # Dev only — disables rate limiting

# JWT
JWT_ACCESS_SECRET=very_long_random_secret
JWT_REFRESH_SECRET=another_very_long_random_secret

# SMTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=app_password
SMTP_FROM=you@gmail.com

# Admin Seed
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=StrongPass123
SEED_ADMIN_NAME=Admin User

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_api_secret
```
