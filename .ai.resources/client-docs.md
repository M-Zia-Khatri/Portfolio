# Client Documentation

## Overview

The client is a React 19 + TypeScript + Vite SPA styled with Radix Themes and Tailwind CSS v4. It serves as the frontend for a full-stack developer portfolio — public-facing pages plus a protected admin dashboard. State management uses Zustand for auth and TanStack Query for server state. Animations are handled via GSAP and Motion (Framer Motion v12).

---

## Project Structure

```
client/src/
├── app/
│   └── routes/
│       ├── AppRoutes.tsx       # Route definitions
│       └── router.ts           # createBrowserRouter
├── assets/
│   ├── fonts/
│   ├── images/
│   └── styles/
│       └── index.css           # Global styles, Radix theme overrides, CSS vars
├── features/
│   ├── auth/                   # Authentication (login + OTP flow)
│   ├── contact/                # Public contact form + admin contact page
│   ├── dashboard/              # Admin dashboard pages (skills, portfolio, contact)
│   ├── game/                   # Guess-the-number mini-game
│   ├── home/                   # Public homepage sections
│   ├── landing/                # First-visit landing/splash
│   ├── portfolio/              # Public portfolio display
│   └── skills/                 # Skill types, data, and UI components
├── shared/
│   ├── api/                    # Axios instance, interceptors, ETag store
│   ├── components/             # Reusable UI components
│   ├── constants/              # Navigation and style constants
│   ├── hooks/                  # GSAP hooks, debounce, etc.
│   ├── lib/                    # Lenis smooth scroll
│   ├── store/                  # Zustand auth store
│   └── utils/                  # cn(), resolveResponsive()
└── main.tsx                    # Entry point
```

---

## Entry Point

### `src/main.tsx`

Bootstraps the app inside `StrictMode`. Wraps with `HelmetProvider` (for SEO), then renders `<App />`. Imports global CSS and Lenis CSS.

### `src/app/App.tsx`

Top-level component. Sets up:
- `QueryClientProvider` — TanStack Query with 7.5-min stale time, 15-min gc time, no retry.
- `Theme` — Radix dark theme, blue accent, small radius.
- `AuthProvider` — syncs auth state from server to Zustand.
- `RouterProvider` — renders the browser router.

---

## Routing

### `src/app/routes/AppRoutes.tsx`

All routes use `lazy()` + `Suspense` via the `withSuspense()` helper.

| Path | Component | Notes |
|---|---|---|
| `/` | `AppLayout` → `Home` | Public homepage |
| `/auth` | `Auth` | Login + OTP flow |
| `/login` | Redirect → `/auth` | |
| `/admin` | Redirect → `/dashboard` | |
| `/dashboard` | `DashboardLayout` → `Dashboard` | Protected, role: `admin` |
| `/dashboard/skills` | `Skills` | Admin skills manager |
| `/dashboard/portfolio` | `Portfolio` | Admin portfolio manager |
| `/dashboard/contact` | `ContactPage` | Admin contact inbox |
| `*` | Redirect → `/` | 404 fallback |

`DashboardLayout` wraps all dashboard routes in `ProtectedRoute` which checks `isAuthenticated` and `hasRole(['admin'])`.

---

## Global Styles (`src/assets/styles/index.css`)

Defines the full Radix color palette override for the dark theme using custom CSS variables (`--blue-1` through `--blue-12`, `--gray-1` through `--gray-12`, plus alpha variants). Also sets:

- `--color-background: #050505`
- Container size tokens (`--container-1` through `--container-4`)
- Custom fonts: Inter (Google), Special Gothic Expanded One (local TTF)
- Heading font override for all Radix `<Heading>` components
- Lenis smooth scroll classes
- `code-line` / `code-cursor` CSS for the animated code editor component
- `fadeUp` keyframe for text loop animation

P3 color gamut support is included via `@supports (color: color(display-p3 1 1 1))` using oklch values.

---

## Features

### Auth (`src/features/auth/`)

Two-step login flow: **email + password → OTP verification**.

#### Components

**`Auth.tsx`** — Orchestrates the two-step flow. Shows `LoginForm` on step `'login'`, `OtpForm` on step `'otp'`. Reactive redirect to `/dashboard` when `isAuthenticated` becomes true. Handles OTP resend by re-calling `POST /auth/login`.

**`LoginForm.tsx`** — Email + password form using react-hook-form + Zod (`loginSchema`). Features:
- Auto-focus on open via `useAutoFocus` hook.
- Password show/hide toggle with 5-second auto-hide timer.
- `useApiError` for server error display.
- Merges RHF ref with auto-focus ref to avoid overwriting.

**`OtpForm.tsx`** — 6-digit OTP input. Features:
- Numeric-only enforcement (strips non-digits on change).
- 60-second resend cooldown via `useCooldown`.
- Auto-focus on open.

**`DialogShell.tsx`** — Animated modal shell using Radix `Dialog` (not `AlertDialog`). AnimatePresence-driven overlay + panel with spring enter / ease-in exit. Accepts `config: AuthStepConfig` for title, badge, description.

#### Hooks

| Hook | Purpose |
|---|---|
| `useLogin` | `useMutation` → `POST /auth/login` |
| `useVerifyOtp` | `useMutation` → `POST /auth/verify-otp`, stores access token, invalidates `['me']` |
| `useMe` | `useQuery` → `GET /auth/me`, no retry, no refetch on focus |
| `useLogoutAll` | `useMutation` → `POST /auth/logout-all`, calls `logout()` on success or error |
| `useAutoFocus` | Sets focus on element 80ms after `active` flips true |
| `useCooldown` | Countdown timer, resets when `active` flips true |
| `useApiError` | `useState` wrapper with `handleError` (reads axios response message) and `clearError` |

#### Context & Store

**`AuthContext.tsx`** / **`AuthProvider`** — Runs `useMe` on mount. Syncs result into Zustand: sets user on success, clears user on error/no-session. Also sets the QueryClient bridge and runs `useAutoRefresh`.

**`useAuthStore`** (Zustand) — Holds `user`, `isAuthenticated`, `isLoading`. `logout()` clears access token cookie and the entire React Query cache. `hasRole(roles)` checks `user.role`.

**`useAutoRefresh`** — Sets a 14-minute interval (1 min before 15-min JWT expiry) to call `POST /auth/refresh` and update the access token cookie. Clears interval when unauthenticated.

#### Token Management

**`tokenManager.ts`** — Cookie-based token storage. `setAccessToken` / `getAccessToken` / `clearAccessToken` operate on `access_token` cookie (15-min max-age). `setTokens` also supports refresh token (7-day max-age). `Secure` flag added in production only.

**`cookieManager.ts`** — Low-level `getCookie` / `setCookie` / `clearCookie` helpers. `SameSite=strict` by default.

#### Schemas

```ts
loginSchema = { email: string().email(), password: string().min(8) }
otpSchema   = { code: string().length(6).regex(/^\d+$/) }
```

---

### Contact (`src/features/contact/`)

#### Public Contact Form (`public/ContactForm.tsx`)

Multi-layer memoized form card. Uses `useOptimistic` + `useTransition` for optimistic success state. Submits to `POST /contact`. Shows success callout on submit, error callout on failure. Zod schema: `fullName` (min 1), `email` (valid), `message` (min 10).

#### Public Contact Code Card (`public/ContactCodeCard.tsx`)

Animates through fetched `code`-mode skills in a `CodeCard` with auto-advancing tabs. States: `idle → typing → advancing → done`. Supports tab-click pause with auto-resume after 10–20s. Shows a progress rail of colored dots. Hidden on mobile (contact section uses grid).

#### Admin Contact Page (`admin/ContactPage.tsx`)

Protected page listing all contact form submissions. Features debounced search (250ms) across name/email/message. Uses `VirtualList` for efficient rendering. `ContactDetails` dialog shows full message + delete button.

#### API (`api.ts`)

- `submitContactForm` — `POST /contact`
- `useContacts` — `useQuery` → `GET /contact`, handles multiple response shapes
- `useDeleteContact` — `useMutation` → `DELETE /contact/:id`, invalidates `['contacts']`

---

### Dashboard (`src/features/dashboard/`)

#### Layout (`layout/DashboardLayout.tsx`)

Wraps all dashboard pages in `ProtectedRoute` (redirects to `/auth` if unauthenticated or not admin). Uses `AnimatePresence` with `mode="wait"` for page transition animation (fade + slide).

#### Topbar (`layout/topbar/Topbar.tsx`)

Sticky admin topbar with:
- "Go Back" link → `/`
- Admin Portal brand
- Desktop nav links with active state via `NavLink`
- Live clock (updates every second)
- Logout button → calls server logout + navigates to `/`
- Mobile dropdown menu via Radix `DropdownMenu`

#### Dashboard Overview (`Dashboard.tsx`)

Simple welcome card. No data.

---

### Dashboard — Skills (`dashboard/pages/skills/`)

Full CRUD interface for skills displayed on the public homepage.

#### `Skills.tsx`

Main page component. Renders a sidebar list of skills (with edit/delete controls) and a live preview `CodeCard` on the right. Uses optimistic deletion (clears `activeSkillId` when the active skill is deleted). All mutations receive an `onError` callback for feedback.

**Key logic:**
- `toMappedSkill(apiSkill)` — resolves string icon key to React component via `ICON_MAP`. Warns on unknown keys and falls back to `FaCode`.
- Active skill falls back to index 0 if `activeSkillId` is stale.
- `onFormSubmit` splits `content` string into `code[]` for code-mode skills; passes `commands[]` as-is for terminal-mode.

#### `SkillDialog.tsx`

`Dialog` form for creating/editing skills. Supports two modes:
- **Code mode** — `TextArea` for multi-line code content.
- **Terminal mode** — Dynamic field array (`useFieldArray`) for structured command lines (kind: command/output/comment/blank).

Resets with correct defaults when `open` or `initialData` changes.

#### `skills.schema.ts`

```ts
skillSchema = {
  name, fileName, lang,
  color: hex regex,
  mode: 'code' | 'terminal',
  icon: string,
  content?: string,       // code mode
  commands?: TerminalLine[] // terminal mode
}
```

#### `skills.api.ts`

- `fetchSkills(mode?)` — `GET /skills?mode=...`
- `createSkill(payload)` — `POST /skills`
- `updateSkill(id, payload)` — Fetches fresh ETag first, then `PATCH /skills/:id` with `If-Match` header
- `deleteSkill(id)` — `DELETE /skills/:id`

#### `useSkillActions.ts`

TanStack Query wrappers. All mutations invalidate `['skills']` on success and accept optional `onError` callback.

| Hook | Query Key |
|---|---|
| `useSkillsData` | `['skills']` |
| `useSkillsCodeData` | `['skills-code']` (mode=code) |
| `useCreateSkill` | — |
| `useUpdateSkill` | — |
| `useDeleteSkill` | — |

#### `iconMap.ts`

Maps string icon keys (stored in DB) to React components. `ICON_OPTIONS` is used to populate the icon `<Select>` in `SkillDialog`. Always includes `default: FaCode` fallback.

---

### Dashboard — Portfolio (`dashboard/pages/portfolio/`)

Full CRUD interface for portfolio items with image upload to Cloudinary.

#### `Portfolio.tsx`

Manages portfolio items with:
- **Optimistic create** — adds a placeholder with `id: 'optimistic-${Date.now()}'`, replaced by server item on success.
- **Optimistic update** — merges payload into cached item immediately.
- **Optimistic delete** — filters item out immediately.
- All mutations roll back on error via `onMutate` context.
- Tech and role filter dropdowns, with animated "Clear filters" button.
- Skeleton loading grid (6 cards).

#### `PortfolioDialog.tsx`

Create/edit form with:
- Different Zod schemas for create (image required) vs. edit (image optional).
- Live image preview via `URL.createObjectURL`.
- Cloudinary upload on submit via `uploadToCloudinary()`.
- Animated error states with `AnimatePresence`.

#### `PortfolioCard.tsx`

Admin card with hover overlay showing edit/delete icon buttons. Image load error fallback to placeholder.

#### `portfolio.api.ts`

All mutation endpoints use ETag-based optimistic locking:
- `fetchPortfolio()` — `GET /portfolio`
- `createPortfolio(payload)` — `POST /portfolio` + stores ETag
- `updatePortfolio(id, payload)` — fetches fresh ETag, then `PATCH /portfolio/:id` with `If-Match`
- `deletePortfolio(id)` — fetches fresh ETag, then `DELETE /portfolio/:id` with `If-Match`
- `uploadToCloudinary(file)` — direct browser upload using `VITE_CLOUDINARY_UPLOAD_PRESET` and `VITE_CLOUDINARY_CLOUD_NAME`.

#### `portfolio.types.ts`

```ts
PortfolioItem     = { id, site_name, site_role, site_url, site_image_url, use_tech: string[], description }
PortfolioFormValues = { ..., site_image?: FileList, use_tech: string } // comma-separated in form
ApiResponse<T>    = { success, status, message, data?, error?, meta? }
```

---

### Home (`src/features/home/`)

#### `Home.tsx`

Renders each section inside `DeferredSection` — an `IntersectionObserver`-based component that only mounts section content when the section enters the viewport (with 350px root margin). The hero section is always eager-rendered. Each section is wrapped in `Suspense`.

#### `Home.config.ts`

Defines the sections array (id + lazy component) and shared `sectionClassName`. Sections: `home`, `about`, `skills`, `portfolio`, `game`, `contact`.

#### `useSectionActive.ts`

Shared-singleton `IntersectionObserver` that tracks which sections are ≥30% visible. Uses a `Map`-based pub/sub pattern so multiple consumers of the same section ID share one observer entry. Dispatches state changes via `requestAnimationFrame` batching. Forces GSAP `ScrollTrigger.refresh()` when a section becomes visible.

#### Sections

**`HeroSection.tsx`** — Full-viewport hero. Conditionally renders `BgScene` (animated SVG lines) on large screens with no reduced-motion preference. Uses `TextLoop` for cycling headline words (EXPERIENCES / APPLICATIONS / SOLUTIONS / PRODUCTS / PLATFORMS).

**`BgScene.tsx`** — GSAP-driven SVG animation. Creates vertical wavy lines (`count = ceil(width/10)`) that deform around the mouse cursor. Uses a Lua-style mouse-smoothing lerp and a shared cleanup function attached to the SVG element. Handles resize with 200ms debounce.

**`AboutSection.tsx`** — Three-column grid. Left: portrait image with motion scale-in. Right: bio text with motion fade-in.

**`SkillsSection.tsx`** — Fetches skills via `useSkillsData`. Maps API skills to runtime `Skill` type (resolving icon). Manages open tabs and active skill state. Renders `SkillChip` buttons and a `CodeCard`. Pauses animation when section is not visible via `useSectionActive`.

**`PortfolioSection.tsx`** — Fetches portfolio via TanStack Query. Maps snake_case API fields to camelCase `PortfolioItem`. Renders `PortfolioItemCard` in a 2-column staggered motion grid. Shows skeletons, error state, and empty state.

**`GameSection.tsx`** — Wraps the full guess-number game in `GuessNumProvider`. Responsive layout: sidebar (desktop GuessResult), center (HiddenNumber + CheckHiddenNumber), right (ScoreHistory + ViewDelHistory).

**`ContactSection.tsx`** — Side-by-side layout: `ContactFormCard` (always visible) + `ContactCodeCard` (desktop only). Uses `useSectionActive` to pause/resume the code animation.

---

### Skills UI Components (`src/features/skills/components/`)

#### `SkillChip.tsx`

Animated button chip for each skill. On click, creates a GSAP ripple effect using a dynamically created `<span>`. Shows active state with color border glow, rotates icon 360° when active.

#### `CodeTabBar.tsx`

VS Code-style tab bar. GSAP animates new tabs in. Auto-scrolls to the active tab if it overflows. Shows macOS-style traffic light dots, tab icons, file names, and close buttons. Language label shown on the right.

#### `CodeLine.tsx`

Single code line with syntax highlighting. Line number in a `w-10` column. Uses memoized `tokenise()` output. Active line has a CSS-only blinking cursor (`code-cursor` class).

#### `CodeEmptyState.tsx`

GSAP fade-in + floating folder emoji animation. Shown when no tabs are open.

#### `TerminalView.tsx`

Animates terminal command blocks with character-by-character typing using GSAP timeline. Builds "blocks" (command + its outputs) from the flat `TerminalLine[]` array. Maintains state for completed blocks, active block, and active outputs. Shows a blinking cursor at the end when done.

#### `TerminalLine.tsx`

Renders a single terminal line based on `kind`: blank (spacer), comment (dim), output (indented, lighter), command ($ prefix + text + optional typing cursor).

#### `tokeniser.ts`

Simple regex-based syntax tokeniser. Recognises: comments (`//`, `#`), strings, keywords (import/export/const/etc.), types, HTML/JSX tags, function names. Returns `Token[]` with text + color from `TOKEN_COLORS` map.

---

### Game (`src/features/game/`)

A guess-the-number game with difficulty levels, timer, and score history.

#### Context (`context/GuessNumContext.tsx`)

Split into four contexts to prevent unnecessary re-renders:
- `GuessNumStatusContext` — `randomNumber`, `showNumber`, `started`, `playerName`, `didWin`
- `GuessNumProgressContext` — `guessTurn`, `guessResults`
- `GuessNumTimerContext` — `timeLeft`
- `GuessNumActionsContext` — `startGame`, `makeGuess`, `restartGame`, `setStarted`, `clearHistory`, `clearAndReloadHistory`

Score is calculated on game end: attempt score + time score + close-guess bonus + difficulty level bonus. Score is saved to `GameSetStore` via `startTransition` to avoid blocking the UI. Duplicate saves are prevented by tracking a `gameSignature`.

#### `gameReducer.ts`

Pure reducer managing: `RESET_GAME`, `MAKE_GUESS` (handles win/lose detection and `showNumber`), `REVEAL_NUMBER`, `SET_STARTED`, `SET_PLAYER_NAME`.

Feedback categories: `'you win'`, `'very close'` (within 15% threshold), `'too low'`, `'too high'`.

#### Store (`store/GameSetStore.ts`)

Zustand + `persist` middleware. Persists `scoreHistory` and `customLevels` to `localStorage` under key `'guess-number-history'`. Date fields are hydrated back to `Date` objects on rehydration. Slices: game settings (maxNumber, guessLimit, timeLimit, difficultLevel) + custom levels CRUD + score history CRUD.

#### Components

**`HiddenNumber.tsx`** — Shows timer, level selector, start form (name input + start button), the hidden ball (revealed on game end), and post-game result + replay button. All sub-components are memoized.

**`CheckHiddenNumber.tsx`** — Grid of number buttons (1 to maxNumber). Each button is disabled after being guessed, when number is shown, or before game starts. Button color indicates result (green = win, amber = very close, blue = other).

**`ScoreHistory.tsx`** — Table of past games with `useDeferredValue` for non-blocking renders. Shows rank, name, score, result badge.

**`SelDifficultLevel.tsx`** — Radix `Select` with built-in presets (easy/normal/hard/very-hard) and user custom levels. Sentinel value `'__add_custom__'` opens `CustomLevelDialog` instead of selecting.

**`CustomLevelDialog.tsx`** — CRUD dialog for custom difficulty presets. Validates name, maxNumber (2–100), guessLimit (1–50), time (minutes + seconds, total > 0). Supports inline editing with cancel.

**`Feedback.tsx`** — Fixed-position toast that appears for 3.5s after each guess.

**`GuessResult.tsx`** — Desktop sidebar showing remaining guesses and guess history list.

**`ViewDelHistory.tsx`** — "Delete All" button with `AlertDialog` confirmation.

**`LevelSelector.tsx`** — Wrapper that dims and disables the level select while a game is in progress.

#### Hooks

**`useGameTimer.ts`** — Countdown timer using `setInterval`. Resets when `initialTime` changes. Calls `onExpire` when reaching 0. Stable via `ref` tracking.

---

### Portfolio Public (`src/features/portfolio/`)

#### `PortfolioItemCard.tsx`

3D flip card with GSAP and Motion. Front shows image with parallax tilt + hover shine sweep + link button. Back shows grid with animated shine sweep (GSAP timeline, paused until flipped), description, and tech badges with staggered spring animation. Mouse tilt via `useMotionValue` + `useTransform`.

#### Types

```ts
PortfolioItem = { siteName, siteRole, siteUrl, siteImageUrl, useTech: string[], description }
```

---

## Shared

### API (`src/shared/api/`)

#### `axios.ts`

Creates axios instance with `baseURL = VITE_API_URL || 'http://localhost:5000/api'` and `withCredentials: true`. Attaches interceptors immediately.

#### `interceptors.ts`

**Request interceptor:**
- Attaches `Authorization: Bearer <token>` from cookie.
- For `PATCH`/`PUT`/`DELETE`, looks up stored ETag and attaches `If-Match` header.
- Removes `X-Explicit-ETag` custom header after reading it.

**Response interceptor:**
- Stores ETags from responses in `etag-store`.
- On 412 → clears ETag, rejects with friendly message.
- On 428 → rejects with "Edit validation failed".
- On 404 → clears ETag.
- On 401 → attempts silent token refresh. Queues concurrent 401 requests until refresh completes. On refresh failure, clears access token.

#### `etag-store.ts`

In-memory `Map<string, string>` for storing ETags by normalized URL. UUID path segments are normalized to `/:id` so `/portfolio/abc-123` and `/portfolio/def-456` share the same key pattern.

Functions: `setETag`, `getETag`, `clearETag`, `clearAllETags`, `normalizeUrl`.

---

### Shared Components

#### `CodeCard.tsx`

Wraps the code editor experience. Accepts `skill`, `openTabs`, callbacks, `started`, `isActive`, and `codeContainerRef`. In code mode, runs a GSAP timeline that types each line character-by-character, using `useDeferredValue` for completed lines so the UI stays responsive. In terminal mode, delegates to `TerminalView`. Exposes `pause()`/`resume()` via `useImperativeHandle` for external control.

#### `ProtectedRoute.tsx`

Checks `isLoading` (shows animated pulse), `isAuthenticated` (redirects to `redirectTo`), and `allowedRoles` (redirects to `/`). Renders `children` or `<Outlet />`.

#### `SEO.tsx`

`react-helmet-async` wrapper. Sets title (truncated to 60 chars), description (truncated to 160 chars), Open Graph tags, Twitter Card tags, author meta, canonical link, robots, and Schema.org JSON-LD Person structured data.

#### `VirtualList.tsx`

Simple windowing component. Calculates visible range from `scrollTop` with overscan (default 4). Renders absolute-positioned subset of items with correct top offset.

#### `SecContainer.tsx`

Radix `Container` wrapper with responsive `size` (1→4 across breakpoints) and `px` padding shorthand.

#### `TabScrollbarStyle.tsx` / `ContentScrollbarStyle`

Injects scoped `<style>` for custom scrollbar theming using the skill's color value.

#### `BorderTrail.tsx`

Animates a gradient element along the border of its parent using CSS `offset-path: rect(...)` and Motion's `offsetDistance` animation.

#### Motion Primitives

**`text-loop.tsx`** — Cycles through children on an interval using `useState` + `setInterval`. Applies a `fadeUp` CSS animation on the current child.

**`border-trail.tsx`** — Infinite border animation using `offsetPath`.

---

### Shared Hooks

#### GSAP Hooks (`shared/hooks/gsap/`)

**`useGsapReveal`** — Scroll-triggered fade-in + slide-up for a single ref element. Runs once by default.

**`useGsapStagger`** — Scroll-triggered stagger animation for all children of a ref. Calls `ScrollTrigger.refresh()` on complete.

**`useGsapTypingEffect`** (in `shared/hooks/gsap/`) — Selector-based typing reveal using `gsap.utils.toArray`.

#### `useGsapAnimations.ts` (shared hook file)

Contains three hooks used by various components:

**`useGsapReveal(scopeRef, target, options?)`** — Scoped to `scopeRef`, animates `target` selector.

**`useGsapStagger(parentRef, target, options)`** — Same but staggered, with `ScrollTrigger`.

**`useGsapTypingEffect(scopeRef, deps, setup, paused?)`** — Core typing animation. Creates a GSAP timeline, calls `setup(timeline)` to populate it, then plays or pauses based on `paused`. Kills and rebuilds timeline when `deps` change. Returns `tlRef` for external pause/resume.

#### `useDebouncedValue.ts`

Standard debounce hook using `setTimeout`. Cleans up on each value change.

---

### Zustand Auth Store (`src/shared/store/useAuthStore.ts`)

```ts
{
  user: AuthUser | null,
  isAuthenticated: boolean,
  isLoading: boolean,     // starts true
  logout(),              // clears token cookie + query cache
  setUser(user | null),  // sets isAuthenticated
  setLoading(bool),
  hasRole(roles[])       // checks user.role membership
}
```

QueryClient is injected via `setQueryClient(qc)` called from `AuthProvider` so `logout()` can call `queryClient.clear()` without being inside a React component.

---

### Constants

#### `navigation.constants.ts`

```ts
AppNavigation = {
  HOME: '#home', SKILLS: '#skills', ABOUT: '#about',
  PORTFOLIO: '#portfolio', EXPERIENCE: '#experience',
  TESTIMONIALS: '#testimonials', CONTACT: '#contact',
  ADMIN: '/admin', AUTH: '/auth', DASHBOARD: '/dashboard',
  A_SKILLS: '/dashboard/skills', A_CONTACT: '/dashboard/contact',
  A_PORTFOLIO: '/dashboard/portfolio'
}
```

#### `style.constants.ts`

Responsive size maps for headings (h1–h6) and text (sm/base/lg) using Radix's size scale (1–9).

---

### Lenis (`src/shared/lib/lenis.ts`)

Singleton smooth-scroll manager. Mount-count ref-counted so multiple `AppLayout` instances don't double-start. Pauses on `visibilitychange` (tab hidden). Respects `prefers-reduced-motion` (falls back to native scroll). Exposes `scrollToTarget(target, offset)` for anchor navigation with `-96px` topbar offset.

---

### Utilities

#### `cn.ts`

`clsx` + `tailwind-merge` wrapper for conditional className merging.

#### `resolveResponsive.ts`

Resolves a `ResponsiveValue<T>` object (with `mobile`/`tablet`/`laptop`/`desktop` keys and optional `custom` numeric breakpoints) to a concrete value based on `window.innerWidth`. Falls back through breakpoints in descending order.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:5000/api`) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |

---

## Build & Dev

```bash
pnpm dev          # Vite dev server
pnpm build        # tsc -b && vite build
pnpm lint         # ESLint
pnpm preview      # Preview production build
```

**Vite config** (`vite.config.ts`): React plugin with `babel-plugin-react-compiler` (React Compiler enabled), Tailwind CSS v4 via `@tailwindcss/vite`, `@` alias → `./src`, esbuild minification, no sourcemaps in production, 700KB chunk warning limit.

**TypeScript**: Strict mode, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`, bundler module resolution, path alias `@/*`.

---

## Docker

**`Dockerfile`** — Multi-stage: Node 20 Alpine builder runs `pnpm install` + `pnpm build`, then copies `dist/` into `nginx:alpine` with custom `nginx.conf`.

**`nginx.conf`** — Gzip on, 1-year cache for static assets, SPA fallback (`try_files $uri $uri/ /index.html`), `/health` endpoint returning 200.

**`CI/CD`** — GitHub Actions workflow builds and pushes Docker images to GHCR on push to `main`/`develop`. Runs `pnpm lint` + `pnpm build` checks first.
