# Rit Services — Feedback Plugin

A drop-in **screenshot + annotation feedback plugin** for any React + Express app. Published privately to GitHub Packages under the `@rit-services` scope so any team project can install it with `npm install`.

- Captures the **current viewport** — what the user is actually looking at, scroll position included — via `html-to-image`. Inner scroll panes are honored, and entrance animations are frozen so nothing captures half-faded.
- Lets users **annotate** the screenshot — pen, highlighter, arrow, rectangle, text — using a Konva canvas.
- Sends the result by **email** to a configured recipient list. No DB. No file storage.
- Three mount modes for the trigger button: **floating**, **sidebar**, **navbar** (or fully manual). The floating trigger is a **collapsible** megaphone badge that expands to a labeled "Feedback" pill on hover/focus — distinct from a chat bubble so users don't mistake it for a chat widget.
- **3-tier mailer interface** — works whether your host app uses nodemailer, SendGrid, AWS SES, or has no email infrastructure at all.
- Production-only rate limiting (5 submissions / 10 min by default).
- TypeScript end to end.

> 👉 **Just want to use the package in your project?** Read the
> **[Consuming the Feedback Plugin — Developer Guide](./CONSUMING.md)**. It walks
> through authentication, install, and import step by step. The sections below are
> the full feature/API reference.

## Architecture

The plugin ships as **two sibling sub-packages** so the frontend and backend are independently consumable:

| Package | Responsibility |
| --- | --- |
| `@rit-services/feedback-react` | `FeedbackProvider`, `FeedbackButton`, annotation modal, screenshot capture |
| `@rit-services/feedback-server` | `createFeedbackRouter()` Express middleware, mailer adapter, zod validation, rate limiting |

> **Heads-up — two packages = two installs (unless you use workspaces).**
> If your project has separate frontend and backend folders with their own `package.json` files, you must add **`@rit-services/feedback-react`** to the frontend's `package.json` and **`@rit-services/feedback-server`** to the backend's `package.json`, then run `npm install` **in each folder**. Running `npm install` inside the server does **not** install the React side into the client, and vice versa. Each `package.json` is independent. If you have a single combined `package.json` (monolith) or you use npm workspaces, one install covers both.

```
feedback-plugin/                ← this repo (Rit-Services/feedback-plugin)
├── README.md
├── package.json                ← workspace root (private, not published)
├── .npmrc                      ← maps the @rit-services scope to GitHub Packages
├── .github/workflows/publish.yml  ← publishes both packages on a version tag
└── packages/
    ├── react/                  ← @rit-services/feedback-react
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsup.config.ts
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
    └── server/                 ← @rit-services/feedback-server
        ├── package.json
        ├── tsconfig.json
        ├── tsup.config.ts
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

## Installing it in your project (for the team)

This is the whole point — getting the plugin into any Rit Services project with a plain `npm install`. It's a private package, so there's a **one-time auth step per machine**, then it behaves like any npm dependency.

### Step 1 — One-time: tell npm where the `@rit-services` scope lives

The package is hosted on **GitHub Packages**, not the public npm registry. Each developer (and each CI runner) needs to point the `@rit-services` scope at GitHub and authenticate once.

**a)** Create a GitHub **Personal Access Token (classic)** with the **`read:packages`** scope: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic). (Authorize it for SSO against the `Rit-Services` org if SSO is enforced.)

**b)** Add these two lines to your **`~/.npmrc`** (your user-level file — keeps the token out of the repo):

```ini
@rit-services:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_READ_PACKAGES_TOKEN
```

That's it. You never do this again on this machine.

> The **scope mapping** (first line) can also live in the *project's* `.npmrc` (commit that — it's not secret), but the **token line** must stay in your personal `~/.npmrc`, never committed.

### Step 2 — Install

The two packages are independent — install each where it belongs.

**Separate frontend / backend folders** (each with its own `package.json`):

```bash
cd <your-frontend-folder>   # client/, web/, app/ — name doesn't matter
npm install @rit-services/feedback-react

cd ../<your-backend-folder>  # server/, api/, backend/
npm install @rit-services/feedback-server
```

**Single combined `package.json` (monolith)** or **npm/pnpm workspaces** — one install, both listed:

```bash
npm install @rit-services/feedback-react @rit-services/feedback-server
```

`html-to-image`, `konva`, and `react-konva` come in automatically as dependencies of the React package — nothing to add by hand.

### Step 3 — Wire it up

Frontend provider + backend router — see [Frontend usage](#frontend-usage) and [Backend usage](#backend-usage) below. RitJira's live wiring is reproduced under [How RitJira wires it](#how-ritjira-wires-it-live-reference).

---

## Developing this plugin locally

```bash
git clone https://github.com/Rit-Services/feedback-plugin.git
cd feedback-plugin
npm install          # installs both workspaces
npm run build        # tsup → dist/ (ESM + CJS + .d.ts) for both packages
npm run typecheck    # tsc --noEmit across both
```

To test an unpublished change against a real app without publishing, use `npm pack` in a package and `npm install ../path/to/the.tgz` in the host, or `npm link`.

---

## Frontend usage

### 1. Wrap your app

```tsx
import { FeedbackProvider } from '@rit-services/feedback-react';

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
import { FeedbackButton } from '@rit-services/feedback-react';

// In your sidebar
<FeedbackButton variant="sidebar" label="Report a bug" />

// In your navbar
<FeedbackButton variant="navbar" />

// Anywhere inline
<FeedbackButton variant="inline" />
```

Pass `mode: 'manual'` to the provider if you want zero auto-rendered buttons and trigger programmatically:

```tsx
import { useFeedback } from '@rit-services/feedback-react';

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
import { createFeedbackRouter } from '@rit-services/feedback-server';

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

## Publishing a new version

Publishing is automated. A push of a **version tag** triggers the GitHub Actions workflow ([.github/workflows/publish.yml](.github/workflows/publish.yml)), which builds, typechecks, and publishes **both** packages to GitHub Packages using the repo's built-in `GITHUB_TOKEN` — no secrets to manage.

```bash
# 1. Bump the version in BOTH package.json files (keep them in lockstep):
#    packages/react/package.json   →  "version": "0.2.0"
#    packages/server/package.json  →  "version": "0.2.0"

# 2. Commit, tag, push:
git add -A && git commit -m "release: v0.2.0"
git tag v0.2.0
git push origin main --tags
```

The workflow runs on the `v*` tag and publishes `@rit-services/feedback-react@0.2.0` and `@rit-services/feedback-server@0.2.0`. Consumers then upgrade with `npm update @rit-services/feedback-react @rit-services/feedback-server` (or bump the pinned version).

> **One bug fix → everyone upgrades.** That's the entire reason this lives in its own published package instead of being copied around.

### Manual publish (fallback)

If you ever need to publish from your machine instead of CI, authenticate with a token that has **`write:packages`** (in `~/.npmrc`) and run from the repo root:

```bash
npm run build
npm publish --workspace packages/react
npm publish --workspace packages/server
```

`publishConfig` in each `package.json` already targets `https://npm.pkg.github.com` with `restricted` access, so no extra flags are needed.

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
