# @ritjira/screenshot-feedback

A drop-in **screenshot + annotation feedback plugin** for any React + Express app.

- Captures the **current viewport** — what the user is actually looking at, scroll position included — via `html-to-image`. Inner scroll panes are honored, and entrance animations are frozen so nothing captures half-faded.
- Lets users **annotate** the screenshot — pen, highlighter, arrow, rectangle, text — using a Konva canvas.
- Sends the result by **email** to a configured recipient list. No DB. No file storage.
- Three mount modes for the trigger button: **floating**, **sidebar**, **navbar** (or fully manual). The floating trigger is a **collapsible** megaphone badge that expands to a labeled "Feedback" pill on hover/focus — distinct from a chat bubble so users don't mistake it for a chat widget.
- **3-tier mailer interface** — works whether your host app uses nodemailer, SendGrid, AWS SES, or has no email infrastructure at all.
- Production-only rate limiting (5 submissions / 10 min by default).
- TypeScript end to end.

## Architecture

The plugin ships as **two sibling sub-packages** so the frontend and backend are independently consumable:

| Package | Responsibility |
| --- | --- |
| `@ritjira/feedback-react` | `FeedbackProvider`, `FeedbackButton`, annotation modal, screenshot capture |
| `@ritjira/feedback-server` | `createFeedbackRouter()` Express middleware, mailer adapter, zod validation, rate limiting |

> **Heads-up — two packages = two installs (unless you use workspaces).**
> If your project has separate frontend and backend folders with their own `package.json` files, you must add **`@ritjira/feedback-react`** to the frontend's `package.json` and **`@ritjira/feedback-server`** to the backend's `package.json`, then run `npm install` **in each folder**. Running `npm install` inside the server does **not** install the React side into the client, and vice versa. Each `package.json` is independent. If you have a single combined `package.json` (monolith) or you use npm workspaces, one install covers both.

```
plugins/screenshot-feedback/
├── README.md                ← this file
├── package.json             ← workspace root (private)
├── react/                   ← @ritjira/feedback-react
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── FeedbackProvider.tsx
│       ├── FeedbackContext.ts
│       ├── types.ts
│       ├── components/
│       │   ├── FeedbackButton.tsx
│       │   ├── FeedbackModal.tsx
│       │   └── AnnotationCanvas.tsx
│       ├── hooks/useFeedback.ts
│       └── utils/
│           ├── captureScreenshot.ts
│           └── dataUrl.ts
└── server/                  ← @ritjira/feedback-server
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── createFeedbackRouter.ts
        ├── mailer.ts
        ├── rateLimiter.ts
        ├── template.ts
        ├── validators.ts
        └── types.ts
```

---

## Quick start (inside this monorepo)

The plugin is already wired into RitJira. To turn it on locally:

```bash
# at the repo root
npm install
```

Set env vars:

```ini
# server/.env
FEEDBACK_RECIPIENTS=team@example.com,bugs@example.com

# client/.env
VITE_FEEDBACK_MODE=floating       # floating | sidebar | navbar | manual
VITE_FEEDBACK_ENABLED=true
```

Run:

```bash
npm run dev:server
npm run dev:client
```

Sign in to RitJira → bottom-right floating "Feedback" button → click → annotate → submit → recipients receive an email.

---

## Frontend usage

### 1. Wrap your app

```tsx
import { FeedbackProvider } from '@ritjira/feedback-react';

<FeedbackProvider
  config={{
    apiUrl: 'http://localhost:4000/api/feedback',
    mode: 'floating',                 // 'floating' | 'sidebar' | 'navbar' | 'manual'
    floatingPosition: 'bottom-right', // for floating mode
    enabled: true,
    meta: { app: 'my-app', version: '1.2.3' },  // arbitrary metadata sent with every submission
  }}
>
  <App />
</FeedbackProvider>
```

`floating` mode renders the trigger automatically. For the other modes, place the button yourself.

### 2. Mount the button

```tsx
import { FeedbackButton } from '@ritjira/feedback-react';

// In your sidebar
<FeedbackButton variant="sidebar" label="Report a bug" />

// In your navbar
<FeedbackButton variant="navbar" />

// Anywhere inline
<FeedbackButton variant="inline" />
```

Pass `mode: 'manual'` to the provider if you want zero auto-rendered buttons and trigger programmatically:

```tsx
import { useFeedback } from '@ritjira/feedback-react';

const { open } = useFeedback();
<button onClick={open}>Send feedback</button>
```

### 3. Hide elements during capture

By default everything visible is captured. To exclude something (e.g. a sensitive token displayed on screen), add `data-feedback-hide-during-capture` to it:

```tsx
<div data-feedback-hide-during-capture>secret</div>
```

The plugin temporarily hides these nodes during the screenshot pass and restores them after. The plugin's own modal and floating button are auto-tagged with this attribute.

### 4. Coordinate with your own overlays (`feedback:open` event)

When the user triggers feedback, the plugin dispatches a host-agnostic window event **before** it captures, so any open overlays (notification drawers, dropdown menus, modals) can close themselves and stay out of the screenshot:

```ts
window.addEventListener('feedback:open', () => {
  // close your drawer/menu/dialog here
});
```

This is purely optional — ignore it if you have nothing to close.

### Config reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `apiUrl` | `string` | _required_ | Full URL to the backend feedback endpoint |
| `mode` | `'floating' \| 'sidebar' \| 'navbar' \| 'manual'` | `'floating'` | Where the trigger button renders |
| `enabled` | `boolean` | `true` | Hard kill-switch (e.g. only enable in staging) |
| `buttonLabel` | `string` | `'Feedback'` | Text on the trigger button |
| `floatingPosition` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Floating button anchor |
| `withCredentials` | `boolean` | `true` | Send cookies on the POST. Set `false` for token-based APIs |
| `meta` | `Record<string, string \| number \| boolean>` | — | Extra fields included in the submission email |
| `onSubmitSuccess` | `() => void` | — | Callback after the email is queued |
| `onSubmitError` | `(err: unknown) => void` | — | Callback on capture or submit failure |

---

## Backend usage

```ts
import express from 'express';
import { createFeedbackRouter } from '@ritjira/feedback-server';

const app = express();
app.use(express.json({ limit: '15mb' })); // screenshots are ~5-8 MB

app.use(
  '/api/feedback',
  myAuthMiddleware, // optional — see below
  createFeedbackRouter({
    recipients: ['team@example.com'],
    fromAddress: 'feedback@my-app.com',
    subjectPrefix: '[MyApp Feedback]',
    mailer: { /* see "Mailer config" below */ },
  }),
);
```

If your auth middleware sets `req.user = { id, email, name }`, the email body will include who submitted the feedback. Anonymous submissions still work — the user fields are simply omitted.

### Mailer config — three tiers

The plugin **does not assume** your app uses nodemailer. It defines a contract and lets the host fulfill it however they want.

#### Tier 1 — Custom send function (most flexible — recommended for production)

```ts
createFeedbackRouter({
  recipients: ['team@example.com'],
  mailer: {
    send: async ({ to, from, subject, html, text, attachments }) => {
      // Use SendGrid, AWS SES, Mailgun, or your own service — the plugin doesn't care.
      await sendgrid.send({ to, from, subject, html, attachments });
    },
  },
});
```

#### Tier 2 — Pass an existing nodemailer transport

```ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({ /* ... */ });

createFeedbackRouter({
  recipients: ['team@example.com'],
  mailer: { transport: transporter },
});
```

#### Tier 3 — Self-contained (plugin reads its own env vars)

If the host app has **no** email infrastructure, the plugin can stand up its own SMTP transport:

```ts
createFeedbackRouter({ recipients: ['team@example.com'] });
```

```ini
FEEDBACK_SMTP_HOST=smtp.gmail.com
FEEDBACK_SMTP_PORT=587
FEEDBACK_SMTP_SECURE=false
FEEDBACK_SMTP_USER=...
FEEDBACK_SMTP_PASS=...
FEEDBACK_FROM_ADDRESS=feedback@my-app.com
FEEDBACK_RECIPIENTS=team@example.com,bugs@example.com  # alternative to passing in code
```

#### Bonus — Dev mode (no email)

```ts
createFeedbackRouter({
  recipients: ['team@example.com'],
  mailer: { mode: 'console' },
});
```

Logs the would-be send to your logger instead of sending. Useful in local dev.

### Options reference

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `recipients` | `string[]` | `process.env.FEEDBACK_RECIPIENTS` | Email addresses to notify |
| `fromAddress` | `string` | `FEEDBACK_FROM_ADDRESS` / `SMTP_FROM` / `feedback@localhost` | Envelope `from` |
| `subjectPrefix` | `string` | `'[Feedback]'` | Prepended to every email subject |
| `mailer` | see above | self-contained via `FEEDBACK_SMTP_*` env | How emails are sent |
| `rateLimit.enabled` | `boolean` | `NODE_ENV === 'production'` | Default: rate-limited in prod, off in dev |
| `rateLimit.windowMs` | `number` | `600000` (10 min) | Window for rate counting |
| `rateLimit.max` | `number` | `5` | Max submissions per user per window |
| `logger` | `{ info, warn, error }` | `console.*` | Plug in your structured logger |

### Endpoint contract

```
POST /api/feedback
Content-Type: application/json

{
  "title": "Sidebar collapses on mobile",
  "description": "When I resize to <768px, the sidebar overlaps the content.",
  "screenshot": "data:image/png;base64,iVBOR...",
  "pageUrl": "https://app.example.com/projects/ABC",
  "userAgent": "Mozilla/5.0 ...",
  "viewport": { "width": 1440, "height": 900 },
  "meta": { "app": "my-app", "version": "1.2.3" }
}

Responses:
  202  { ok: true }                         — queued for send
  400  { error: 'invalid_payload', issues } — zod failed
  429  { error: 'rate_limited', message }   — too many submissions
  503  { error: 'no_recipients_configured' }
```

---

## Using this plugin in another project

Two paths.

### Option A — Copy the folder (simplest, recommended for now)

1. Copy `plugins/screenshot-feedback/` into the new project.
2. Add the two sub-packages to its workspaces array:
   ```json
   {
     "workspaces": [
       "client",
       "server",
       "plugins/screenshot-feedback/react",
       "plugins/screenshot-feedback/server"
     ]
   }
   ```
3. Add `@ritjira/feedback-react` to the client's `dependencies` (`"*"`), and `@ritjira/feedback-server` to the server's dependencies.
4. Nothing to add by hand — the React package declares `html-to-image`, `konva`, and `react-konva` as direct dependencies, so the host install pulls them in automatically.
5. Run `npm install` at the new project's root.
6. Wire the provider in your client tree and `createFeedbackRouter` in your server.

That's it. Same pattern that's already wired into RitJira — see `client/src/layouts/AppLayout.tsx` and `server/routes/index.ts` for live references.

### Option B — Publish to a private registry (later)

> **Before publishing:** both sub-package `package.json` files currently set `"private": true` (so they can't be published by accident while they live inside this monorepo). Remove that flag from `react/package.json` and `server/package.json` first, and give them real version numbers — they're at `0.1.0` today.

When you're ready to share across non-monorepo projects:

```bash
# inside plugins/screenshot-feedback/react
npm publish --access restricted

# inside plugins/screenshot-feedback/server
npm publish --access restricted
```

Then in any other project:

```bash
npm install @ritjira/feedback-react @ritjira/feedback-server
```

The integration code stays identical.

#### Important — install location depends on your project layout

The two packages are independent. **Where** you install each one depends on how your project is structured:

**1. Separate frontend and backend folders (each with its own `package.json`)**

You must install in **both** folders. One install does NOT cover the other.

```bash
# Frontend folder (could be named client/, frontend/, web/, app/ — name doesn't matter)
cd <your-frontend-folder>
npm install @ritjira/feedback-react

# Backend folder (could be named server/, backend/, api/ — name doesn't matter)
cd ../<your-backend-folder>
npm install @ritjira/feedback-server
```

Each `package.json` gets its own entry. Each `node_modules` is independent.

**2. Single combined `package.json` (monolith, e.g. Next.js fullstack)**

One install, both packages listed in the same `package.json`:

```bash
npm install @ritjira/feedback-react @ritjira/feedback-server
```

**3. npm workspaces / pnpm workspaces / Turborepo**

Add each package to the relevant workspace's `package.json`, then run `npm install` once at the workspace root — it'll wire both up.

> **Folder names are irrelevant.** npm imports packages by name (`@ritjira/feedback-react`), not by path. Whether your folders are called `client`/`server`, `web`/`api`, or anything else, the integration code is the same.

---

## How RitJira wires it (live reference)

**Client** (`client/src/layouts/AppLayout.tsx`):

```tsx
// API_BASE is relative in dev (requests go through the Vite proxy → same-origin),
// and the app's API origin in prod — see client/src/config/urls.ts.
<FeedbackProvider
  config={{
    apiUrl: `${API_BASE}/api/feedback`,
    mode: import.meta.env.VITE_FEEDBACK_MODE ?? 'floating',
    enabled: import.meta.env.VITE_FEEDBACK_ENABLED !== 'false',
    floatingPosition: 'bottom-left',
    meta: { app: 'ritjira' },
  }}
>
  {/* …existing AppLayout content… */}
</FeedbackProvider>
```

**Server** (`server/routes/index.ts`) — uses Tier 1 (custom send fn) to reuse RitJira's existing `mailer` service so feedback flows through the same Resend SMTP that already sends invites:

```ts
router.use(
  '/feedback',
  expressJson({ limit: '15mb' }),
  authHandler,
  createFeedbackRouter({
    subjectPrefix: '[RitJira Feedback]',
    logger,
    mailer: {
      send: async ({ to, subject, html, text }) => {
        for (const recipient of to) {
          await mailer.send({ to: recipient, subject, html, text });
        }
      },
    },
  }),
);
```

`recipients` is read from `FEEDBACK_RECIPIENTS` in `server/.env`. The screenshot is inlined as a base64 `<img>` in the email HTML (RitJira's mailer interface doesn't expose attachments).

---

## Limitations & notes

- **Cross-origin images:** `html-to-image` re-fetches images to inline them. The plugin pre-fetches same-origin / cookie-gated images (e.g. an authed logo endpoint) **with credentials** so they capture correctly, and a failed font/resource fetch falls back gracefully (it retries without embedding web fonts) instead of producing a blank image. Cross-origin CDN images still need permissive CORS to appear.
- **iframes are not captured** by `html-to-image` (browser security boundary). If your app embeds iframes, the user will see a blank rectangle for them in the screenshot.
- **Email attachment sizes:** screenshots are auto-compressed to JPEG below ~8MB before submission. Most providers accept up to 25MB total, but the inline-image approach used in RitJira keeps the body small enough for any provider.
- **Rate limiting state is in-memory.** A horizontally scaled server will give each instance its own bucket. For RitJira's single-process deployment this is fine; for clustered deployments swap the limiter for a Redis-backed version.

---

## License

UNLICENSED — internal Rit Services use.
