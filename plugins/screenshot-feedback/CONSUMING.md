# Consuming the Feedback Plugin — Developer Guide

This guide is for **developers who want to use** `@rit-services/feedback-react` and
`@rit-services/feedback-server` in another project. It explains how the private
package is authenticated and exactly what you need to do to install and import it.

> If you're working **on** the plugin itself (not just using it), see the
> "Developing this plugin locally" and "Publishing a new version" sections of the
> [README](./README.md) instead.

---

## 1. The one thing to understand first

These packages are published **privately** to **GitHub Packages** (not the public
npm registry) under the `@rit-services` scope. Two consequences follow from that,
and everything else in this guide is just detail on these two points:

### a) Git login ≠ npm login

Being logged into git (Git Credential Manager, SSH keys, `git clone` working) does
**NOT** authenticate npm. They are separate systems with separate credential stores.

- `git clone` / `git pull` → uses **git's** credentials.
- `npm install @rit-services/...` → uses **npm's** credentials, read **only** from
  `.npmrc`.

So even if `git` works perfectly with your org account, `npm install` will fail
with **401 / 403 / 404** until npm has its own token. This is the #1 source of
confusion — don't fall for it.

### b) Auth is needed at *install* time, not *run* time

The token matters **only when `npm install` runs**. Once installed and built, the
package is just compiled code. There are three audiences, and only the middle one
needs to do anything:

| Audience | Needs a token? |
| --- | --- |
| **End user of the app** (opens it in a browser) | ❌ No — the code is bundled in at build time |
| **A developer running `npm install`** | ✅ Yes — see [Section 2](#2-one-time-authentication-per-machine) |
| **CI / Docker build** (runs `npm install`) | ✅ Yes — see [Section 5](#5-ci--docker-builds) |

---

## 2. One-time authentication (per machine)

You only do this **once per machine**. After that, `npm install` and `import` are
completely normal forever. Pick the path that matches your setup.

### Path A — You have the GitHub CLI (`gh`) — recommended

This reuses your existing GitHub login, so there's **no manual token to create**.

```bash
# 1. Add the packages scope to your gh login (the default login does NOT include it)
gh auth refresh -s read:packages

# 2. Point the @rit-services scope at GitHub Packages and hand npm gh's token
npm config set @rit-services:registry=https://npm.pkg.github.com
npm config set -- //npm.pkg.github.com/:_authToken=$(gh auth token)
```

Those `npm config set` commands write into your `~/.npmrc` for you — no manual file
editing. Because your `gh` login already passed the org's SSO, the token is already
SSO-authorized.

> Don't have `gh`? Install it from https://cli.github.com/ and run `gh auth login`
> first, or use Path B.

### Path B — Classic Personal Access Token (raw git / no `gh`)

1. Create a **Personal Access Token (classic)** at
   GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**.
2. Give it the **`read:packages`** scope (only that — nothing else is needed to install).
3. If the `Rit-Services` org enforces SAML SSO, click **"Configure SSO"** on the
   token and **authorize it for the `Rit-Services` org**. (Skipping this is the most
   common cause of a 403 even when the token looks correct.)
4. Add these two lines to your **user-level** `~/.npmrc` (on Windows:
   `C:\Users\<you>\.npmrc`):

   ```ini
   @rit-services:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=ghp_YourTokenHere
   ```

> **Keep the token in `~/.npmrc`, never in a project's committed `.npmrc`.** The
> scope-mapping line (the first one) is safe to commit; the `_authToken` line is a
> secret and must not be.

### Verify it worked

```bash
npm view @rit-services/feedback-react version
```

If that prints a version number, you're authenticated. If it 401s/403s, re-check
the SSO authorization (Path B step 3) or that you ran `gh auth refresh -s read:packages`
(Path A step 1).

---

## 3. Install

The two packages are independent — install each where it belongs. **Folder names
don't matter**; npm resolves by package name, not path.

### Separate frontend / backend folders (each has its own `package.json`)

Install in **both** — one install does not cover the other.

```bash
cd <your-frontend-folder>      # client/, web/, app/ …
npm install @rit-services/feedback-react

cd ../<your-backend-folder>    # server/, api/, backend/ …
npm install @rit-services/feedback-server
```

### Single combined `package.json` (monolith) or npm/pnpm workspaces

One install, both listed:

```bash
npm install @rit-services/feedback-react @rit-services/feedback-server
```

`html-to-image`, `konva`, and `react-konva` come in automatically as dependencies
of the React package — you don't add them by hand.

---

## 4. Import and wire it up

Once installed, importing is completely normal — no special config:

**Frontend** (wrap your app once, then the floating button appears automatically):

```tsx
import { FeedbackProvider } from '@rit-services/feedback-react';

<FeedbackProvider
  config={{
    apiUrl: `${API_BASE}/api/feedback`,  // your backend feedback endpoint
    mode: 'floating',                    // 'floating' | 'sidebar' | 'navbar' | 'manual'
    enabled: true,
    meta: { app: 'my-app' },
  }}
>
  <App />
</FeedbackProvider>
```

**Backend** (mount the router on your Express app):

```ts
import { createFeedbackRouter } from '@rit-services/feedback-server';

app.use(
  '/api/feedback',
  express.json({ limit: '15mb' }),  // screenshots are a few MB
  createFeedbackRouter({
    recipients: ['team@example.com'],
    subjectPrefix: '[MyApp Feedback]',
    mailer: { /* custom send fn, nodemailer transport, or env-based SMTP */ },
  }),
);
```

The full config tables (all `FeedbackProvider` props, all `createFeedbackRouter`
options, the 3-tier mailer, the endpoint contract, and a live RitJira reference)
are in the [README](./README.md#frontend-usage). This guide is only about
*getting the package in*; the README is about *using its features*.

These are the plugin's **own** runtime config (`apiUrl`, `recipients`, SMTP, etc.).
They have nothing to do with GitHub auth — that was only the install step.

---

## 5. CI / Docker builds

Your CI pipeline and Docker image build also run `npm install`, so they need the
token too — but as an **injected secret**, never a committed file.

Recommended pattern: commit a **project-level `.npmrc`** that references an env var…

```ini
# .npmrc (committed in the consuming project — no secret in here)
@rit-services:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

…and provide `NODE_AUTH_TOKEN` from a secret at build time.

- **GitHub Actions in the consuming repo:** the built-in `secrets.GITHUB_TOKEN`
  works if the workflow has `permissions: packages: read` and the package grants
  the repo access. Otherwise use an org-level PAT secret.
- **Docker build:** pass the token as a `--secret` (BuildKit) or build-arg and write
  the `.npmrc` inside the build stage. Don't bake the token into a final image layer.

---

## 6. Upgrading to a new version

When a new version is published (see the [README](./README.md#publishing-a-new-version)):

```bash
npm update @rit-services/feedback-react @rit-services/feedback-server
# or bump the pinned version in package.json and re-install
```

One fix in the plugin → everyone upgrades with one command. That's the whole reason
this lives as a published package instead of a copied folder.

---

## 7. Troubleshooting

| Symptom | Cause & fix |
| --- | --- |
| `401 Unauthorized` on install | No token in `.npmrc`, or it's in the wrong file. Re-do [Section 2](#2-one-time-authentication-per-machine). Remember: **git being logged in does nothing for npm.** |
| `403 Forbidden` (token looks right) | Token not **SSO-authorized** for `Rit-Services` (Path B step 3), or missing the `read:packages` scope (Path A step 1). |
| `404 Not Found` for the package | Either not authenticated (GitHub hides private packages as 404), or the `@rit-services` scope isn't mapped to `npm.pkg.github.com` in `.npmrc`. |
| Works locally, fails in CI | CI has no token. See [Section 5](#5-ci--docker-builds). |
| `gh auth token` is empty | You're not logged into `gh` — run `gh auth login` first. |

---

## TL;DR

1. **Once per machine:** authenticate npm to GitHub Packages
   (`gh auth refresh -s read:packages` + 2 `npm config set` commands, **or** a
   classic PAT with `read:packages` in `~/.npmrc`).
2. **Install:** `npm install @rit-services/feedback-react` (frontend) and
   `@rit-services/feedback-server` (backend).
3. **Import normally** and wire the provider + router (see [README](./README.md)).
4. **Git login is not npm login** — if install 401s, this is almost always why.
