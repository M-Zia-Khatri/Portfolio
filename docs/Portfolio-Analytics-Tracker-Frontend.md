# Portfolio Analytics Tracker — Frontend Plan

## 1. Purpose

Implement the browser-side analytics layer for the React/Vite portfolio.

The frontend should:

- Generate anonymous visitor/session identifiers
- Detect SPA route changes
- Track page views
- Track section visibility
- Track portfolio interactions
- Track contact-form funnel events
- Track game events
- Capture traffic-source information
- Capture coarse device/browser information
- Queue and batch analytics events
- Flush events reliably
- Optionally collect sampled performance metrics
- Optionally collect sanitized client errors

Analytics must never block or break the portfolio.

---

# 2. Frontend Folder Structure

Add:

```text
client/src/shared/
└── analytics/
    ├── analytics.ts
    ├── analytics.types.ts
    ├── analytics.events.ts
    ├── analytics.queue.ts
    ├── analytics.session.ts
    ├── analytics.config.ts
    └── index.ts
```

---

# 3. Public Analytics API

Create a single frontend analytics API.

Example:

```ts
analytics.track("project_view", {
  projectId,
});
```

Page tracking:

```ts
analytics.page("/portfolio");
```

Lifecycle:

```ts
analytics.start();
analytics.flush();
```

Components should not communicate directly with the analytics HTTP endpoint.

---

# 4. Analytics Types

Define strict TypeScript types.

Example:

```ts
type AnalyticsEvent =
  | "page_view"
  | "section_view"
  | "project_view"
  | "project_demo_click"
  | "project_github_click"
  | "contact_open"
  | "contact_form_start"
  | "contact_submit"
  | "contact_success"
  | "game_open"
  | "game_start"
  | "game_level_selected"
  | "game_complete"
  | "game_abandon"
  | "performance"
  | "client_error";
```

Event payloads should be typed.

Do not expose an unrestricted:

```ts
track(event: string, metadata: any)
```

API.

---

# 5. Anonymous Visitor ID

Generate a random anonymous identifier.

Recommended:

```text
UUID
```

The identifier must not contain:

- Name
- Email
- Authentication ID
- IP address
- Password
- Other identifying information

Store it using an appropriate browser storage mechanism.

---

# 6. Session ID

Generate a session identifier.

A session should expire after a configurable inactivity period.

Recommended initial threshold:

```text
30 minutes
```

Session information should include:

```text
sessionId
startedAt
lastActivityAt
```

---

# 7. Session Lifecycle

Recommended behavior:

```text
First visit
    ↓
Create visitor ID
    ↓
Create session ID
    ↓
Track page_view
```

When activity continues:

```text
same visitor
same session
```

After the configured inactivity threshold:

```text
same visitor
new session
```

---

# 8. Traffic Source Detection

Read the current URL for:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Capture the referrer:

```ts
document.referrer
```

Normalize where possible.

Examples:

```text
Google
GitHub
LinkedIn
YouTube
Reddit
Direct
Other
```

Do not repeatedly send the same UTM information with every event.

Attach source information to the session/initial analytics context.

---

# 9. Device Information

Collect coarse browser information.

Recommended:

```text
deviceType
browser
os
screenWidth
screenHeight
```

Device categories:

```text
desktop
tablet
mobile
```

Do not implement browser fingerprinting.

Do not collect unnecessary device identifiers.

---

# 10. Route/Page Tracking

The portfolio is a React single-page application.

Page views should be triggered on route changes.

Do not add manual analytics calls to every page if centralized route tracking is possible.

Recommended:

```text
React Router navigation
        ↓
analytics.page(path)
        ↓
queue page_view event
```

Track:

```text
path
title
timestamp
```

---

# 11. Page View Event

Example:

```ts
analytics.track("page_view", {
  path,
  title: document.title,
});
```

The system should avoid duplicate page-view events for the same navigation.

---

# 12. Section Tracking

The homepage contains sections.

Recommended:

```text
hero
about
experience
skills
portfolio
testimonials
game
contact
```

Use:

```text
IntersectionObserver
```

Do not listen to every scroll event.

A section should be considered viewed when it reaches a meaningful visibility threshold.

Recommended initial approach:

```text
50% visibility
```

Track each section once per session unless intentionally configured otherwise.

Example:

```ts
analytics.track("section_view", {
  section: "portfolio",
});
```

---

# 13. Portfolio Tracking

The portfolio contains project cards.

Track:

```text
project_view
project_demo_click
project_github_click
```

Example:

```ts
analytics.track("project_view", {
  projectId,
});
```

For buttons:

```ts
analytics.track("project_demo_click", {
  projectId,
});
```

```ts
analytics.track("project_github_click", {
  projectId,
});
```

Do not track every hover.

Track meaningful interactions only.

---

# 14. Contact Tracking

Track the contact funnel:

```text
contact_open
contact_form_start
contact_submit
contact_success
```

Recommended behavior:

### Contact open

When the contact section/form becomes meaningfully visible or is explicitly opened.

### Form start

When the visitor begins interacting with the form.

### Submit

When the form is submitted.

### Success

Only after the existing contact API confirms success.

Never send:

```text
name
email
phone
message
```

to analytics.

---

# 15. Game Tracking

The portfolio contains a game feature.

Track:

```text
game_open
game_start
game_level_selected
game_complete
game_abandon
```

Optional metadata:

```text
difficulty
score
attempts
durationMs
```

Analytics should observe the game.

Do not tightly couple analytics to the game's core state management.

---

# 16. Event Queue

Do not make an HTTP request for every analytics event.

Instead:

```text
User action
    ↓
analytics.track()
    ↓
Event Queue
    ↓
Batch
    ↓
POST /api/analytics/events
```

Recommended defaults:

```text
Batch size: 10–20
Flush interval: 5–10 seconds
Maximum queue size: configurable
```

---

# 17. Batch Request

Example:

```json
{
  "visitorId": "anonymous-id",
  "sessionId": "session-id",
  "events": [
    {
      "type": "page_view",
      "path": "/portfolio",
      "timestamp": "2026-08-13T00:00:00.000Z",
      "metadata": {}
    }
  ]
}
```

The client should send batches to:

```text
POST /api/analytics/events
```

---

# 18. Retry Behavior

Analytics requests should have limited retries.

Recommended:

```text
Retry a small number of times
↓
If still failing
↓
Drop the event batch
```

Do not retry indefinitely.

Do not block the user interface.

Do not display analytics errors to visitors.

---

# 19. sendBeacon

When the page is being unloaded and analytics data needs to be flushed, use:

```ts
navigator.sendBeacon(...)
```

where appropriate.

Do not depend exclusively on `sendBeacon`.

It is a reliability mechanism, not the primary event transport.

---

# 20. Analytics Failure Handling

If analytics fails:

```text
portfolio continues working
navigation continues
contact form continues
game continues
```

Analytics should fail silently.

Do not allow analytics exceptions to propagate into application UI.

---

# 21. Section Deduplication

Avoid duplicate section events.

Example:

```text
portfolio section visible
    ↓
section_view emitted
    ↓
mark portfolio as viewed
    ↓
do not emit again during the same session
```

This prevents unnecessary event volume.

---

# 22. Performance Considerations

Analytics must not become part of the critical rendering path.

Rules:

1. Initialize asynchronously.
2. Do not block React rendering.
3. Keep analytics state outside normal UI state where possible.
4. Avoid unnecessary React context updates.
5. Avoid frequent component rerenders.
6. Batch events.
7. Keep payloads small.
8. Avoid third-party analytics libraries.
9. Avoid expensive processing on every event.
10. Do not make analytics a prerequisite for application startup.

---

# 23. Performance Telemetry

Performance tracking is optional for the first release.

If enabled, collect sampled metrics:

```text
TTFB
FCP
LCP
CLS
INP
```

Recommended initial sampling:

```text
5%–10%
```

Performance telemetry should be generated after the page has loaded enough information.

It must not block rendering.

---

# 24. Client Error Telemetry

Optional.

Track sanitized errors:

```text
client_error
```

Possible fields:

```text
errorType
message
route
timestamp
```

Do not send:

- Cookies
- Authorization headers
- Tokens
- Form contents
- Sensitive query parameters
- Large stack traces without sanitization

Limit payload size.

---

# 25. Analytics Configuration

Create:

```text
analytics.config.ts
```

Potential configuration:

```ts
{
  enabled: true,
  endpoint: "/api/analytics/events",
  batchSize: 10,
  flushIntervalMs: 5000,
  sessionTimeoutMs: 30 * 60 * 1000,
  performanceSampleRate: 0.1
}
```

Configuration must come from the existing environment/configuration strategy.

Do not expose secrets to the frontend.

---

# 26. Environment Handling

The frontend should support:

```text
development
production
```

Analytics can be disabled during local development or configured to use the development API.

Never place private server credentials in Vite environment variables.

Remember that frontend environment variables are public.

---

# 27. React Integration

Integrate analytics centrally.

Good integration points include:

```text
App.tsx
Router
AppLayout
shared layout
```

Avoid scattering initialization across unrelated components.

For route tracking, use the existing React Router structure.

---

# 28. Portfolio Integration

Integrate with existing:

```text
PortfolioSection
PortfolioItemCard
```

Track meaningful events:

```text
project_view
project_demo_click
project_github_click
```

Do not modify portfolio business logic unnecessarily.

---

# 29. Contact Integration

Integrate with the existing contact feature.

Potential files already present include:

```text
features/contact/public/ContactForm.tsx
features/contact/public/ContactCodeCard.tsx
```

Track lifecycle events without sending private form data.

---

# 30. Game Integration

Integrate with the existing game components/context.

Relevant existing structure includes:

```text
features/game/
├── components/
├── context/
├── hooks/
├── services/
├── store/
└── types/
```

Analytics should remain separate from game state.

---

# 31. Queue Persistence

Do not immediately persist every event to localStorage.

Prefer an in-memory queue initially.

If reliability requirements later justify persistence, consider a small bounded storage mechanism.

Never allow an analytics queue to grow without limits.

---

# 32. Payload Limits

The client should enforce:

```text
maximum events per batch
maximum metadata size
maximum total payload size
maximum queue size
```

This protects both the browser and server.

---

# 33. Privacy

The frontend must not collect:

```text
passwords
form values
email addresses
names
phone numbers
exact location
keystrokes
mouse recordings
fingerprints
```

Analytics should be limited to meaningful usage data.

---

# 34. Frontend MVP

Initial implementation:

```text
Anonymous visitor ID
Session ID
Page views
Traffic source
Device
Browser
OS
Project views
Project demo clicks
Project GitHub clicks
Contact open
Contact submit
Contact success
```

No live visitors.

No performance telemetry initially.

No client-error telemetry initially.

---

# 35. Frontend Implementation Sequence

Implement:

```text
1. analytics.types.ts
2. analytics.events.ts
3. analytics.config.ts
4. analytics.session.ts
5. analytics.queue.ts
6. analytics.ts
7. index.ts
8. centralized route tracking
9. page_view
10. section_view
11. project events
12. contact events
13. game events
14. optional performance tracking
15. optional error tracking
```

---

# 36. Dependency Policy

Before adding any library:

STOP and ask for approval.

Do not automatically install:

- Google Analytics
- Plausible
- PostHog
- Mixpanel
- Segment
- Sentry
- Fingerprinting libraries
- WebSocket libraries

Prefer the existing React/Vite architecture and browser APIs.

If a package is necessary, explain:

1. Why it is required.
2. What it solves.
3. Bundle-size impact.
4. Runtime impact.
5. Existing-browser-API alternative.

Then request approval.

---

# 37. Frontend Definition of Done

Frontend is complete when:

- Anonymous visitor IDs are generated.
- Sessions are created correctly.
- Route changes create page views.
- Events are batched.
- Analytics requests do not block the UI.
- Analytics errors do not break the portfolio.
- Sections can be tracked without scroll-event spam.
- Portfolio interactions are tracked.
- Contact conversion events are tracked.
- Game events can be tracked.
- Traffic sources are captured.
- Device information is coarse.
- No unnecessary sensitive information is collected.
- The analytics layer is centralized.
- Existing components remain maintainable.
- No third-party analytics dependency is introduced without approval.
