# Completed Work: Phases 1 to 4

A record of everything delivered after the MVP (Phase 0), grouped by phase. For the full
backlog and what is still planned, see `ROADMAP.md`. For how each feature works in detail,
see `FEATURES.md`.

- **Phase 1 — Hardening and polish** (completed 2026-06-09)
- **Phase 2 — Collaboration and roles** (completed 2026-06-10)
- **Phase 3 — Content depth** (core completed 2026-06-10)
- **Phase 4 — Reporting and export** (core completed 2026-06-10)

Test status after these phases: **35 Playwright end-to-end tests, all passing** (one suite per module).

---

## Phase 1 — Hardening and polish

Goal: make the MVP feel production-grade and reliable. Ten items, all shipped.

### Security (server)
- **Security headers** on every API response via `helmet`.
  Files: `server/index.js`.
- **Rate limiting + login lockout** with `express-rate-limit`:
  - The whole auth surface is throttled (300 requests / 15 min per IP, tunable with `RATE_LIMIT_MAX`).
  - A stricter per-account lockout on sign-in counts only failed attempts (10 / 15 min, `LOGIN_LIMIT_MAX`),
    so brute-forcing one account is blocked. `trust proxy` is enabled in production for correct IPs.
  Files: `server/middlewares/rateLimiter.js`, `server/routes/authRoutes.js`.

### Authentication UX
- **Password show/hide toggle** on every password field, plus a **strength meter** on register and reset.
  Files: `client/src/components/ui/PasswordField.jsx`, `Register.jsx`, `ResetPassword.jsx`, `Login.jsx`.
- **Resend verification email** action that appears on the login screen when an unverified user tries to sign in.
  Files: `client/src/views/auth/Login.jsx`.

### Assessments
- **Autosave** of checklist responses on blur and on status change, with a live
  "Saving… / Saved ✓ / Unsaved changes" indicator (the manual Save still works).
  Files: `client/src/components/assessments/ChecklistItem.jsx`.

### Resilience and polish
- **Loading skeletons** replace plain "Loading…" on every data page.
- **Friendly error states** with a Try-again button instead of a raw red banner.
- **React error boundary** so a page crash shows a recovery card, not a blank screen.
- **Friendly 404 page** for unknown routes.
  Files: `client/src/components/ui/Ui.jsx` (Spinner, Skeleton, SkeletonPage, ErrorState),
  `client/src/components/ErrorBoundary.jsx`, `client/src/views/NotFound.jsx`, and all view pages.

### Mobile and accessibility
- **Off-canvas sidebar** with a hamburger button and backdrop on small screens; tables scroll
  horizontally instead of overflowing.
- **Accessibility pass**: visible focus ring, skip-to-content link, `aria-label`s on icon buttons
  and inputs, `role="dialog"` + Escape-to-close on the Law Explorer drawer, and a `<main>` landmark.
  Files: `client/src/styles/global.css`, `client/src/layouts/AppLayout.jsx`, `client/src/components/Sidebar.jsx`,
  `client/src/components/Topbar.jsx`, `client/src/views/lawExplorer/LawExplorer.jsx`.

### Deferred from Phase 1 (moved to later phases)
- Full WCAG audit (Phase 6), tables-to-cards reflow on very narrow screens, and the input-hardening
  review alongside the pen test (Phase 6).

---

## Phase 2 — Collaboration and roles

Goal: let real teams work together, not just a single owner. Exit criteria met: a second teammate
can be invited, given a role, and collaborate on an assessment.

### Data model (new)
- `Invitation` (email, role, tokenHash, status, expiry), `Comment` (per assessment / per item),
  and `assigneeId` on `ChecklistItemResponse`. Plus an index on `AuditLog.entityId` for the activity feed.
  Files: `server/prisma/schema.prisma`, migration `20260609114900_phase2_collaboration`.

### Roles and permissions
- A single **permissions matrix** with actions `members.manage`, `org.manage`, `compliance.edit`,
  `export`, `catalog.manage`, mapped to roles owner / admin / member / platform_admin.
- Enforced server-side with a `requirePermission(action)` guard, and surfaced to the client: the
  session (`/auth/me`, login, accept) now returns the user's `permissions` array, and a `can(perm)`
  helper gates UI controls.
  Files: `server/utils/permissions.js`, `server/middlewares/authHandler.js`,
  `client/src/hooks/useAuth.js`.

### Member invitations
- Owners/admins invite teammates by email (member or admin) from **Settings → Invite a teammate**.
- A 7-day tokenized invitation is created; an email is sent and a **shareable invite link** is also
  returned for the inviter to copy (useful since dev email is console-only).
- The invitee opens **/accept-invite**, sees the org and role, sets their name and password, and joins
  already email-verified, signed straight in.
- Pending invitations are listed and can be revoked.
  Files: `server/controllers/identity/invitationController.js`, `server/routes/invitationRoutes.js`,
  `server/validators/invitationValidator.js`, `server/services/email/emailService.js` (invitation template),
  `client/src/views/auth/AcceptInvite.jsx`, `client/src/views/settings/Settings.jsx`,
  `client/src/apis/invitationApi.js`.

### Member management
- Change a member's role or remove a member from the members table, with guards that prevent
  demoting or removing the last owner and stop non-owners from modifying an owner.
  Files: `server/controllers/identity/userController.js`, `server/routes/userRoutes.js`,
  `client/src/views/settings/Settings.jsx`, `client/src/apis/userApi.js`.
- A **Roles and permissions** reference card explains what each role can do.

### Per-item collaboration
- **Assignee** dropdown on each checklist item (pick any org member).
- **Threaded comments** per checklist item.
- **Activity panel** on the assessment editor showing who changed what and when (from the audit log).
  Files: `server/controllers/compliance/checklistResponseController.js` (assignee + audit),
  `server/controllers/compliance/commentController.js`, `server/routes/commentRoutes.js`,
  `server/controllers/compliance/assessmentController.js` (activity + comments/assignee in detail),
  `client/src/components/assessments/ChecklistItem.jsx`,
  `client/src/views/assessments/AssessmentEditor.jsx`,
  `client/src/apis/commentApi.js`, `client/src/apis/assessmentApi.js`.

### Deferred from Phase 2
- **Multiple organisations per user with an organisation switcher** ([L]). The current model is one
  organisation per user; this is a larger data-model change and was not required for the Phase 2 goal.
  It remains a tracked future item.

---

## Phase 3 — Content depth (core)

Goal: turn catalog-only frameworks into fully usable, cited checklists. Exit criteria met: five
additional frameworks now have working checklists authored as data.

### New schema
- `Framework.sourceNote` and `Framework.lastReviewedAt` (citation + review date per framework).
- `ChecklistTemplate.autoActivate` (default true; `false` marks a sector checklist that is started
  manually rather than attached to every classification). Plus an `AuditLog.entityId` index.
  Files: `server/prisma/schema.prisma`, migration `20260609..._phase3_content_depth`.

### Authored content (5 sector frameworks)
- Full requirements + a checklist with plain-language items, severities and source links for:
  **DORA**, **NIS2**, **EU Data Act**, **Cyber Resilience Act**, and a new **BaFin AI** framework
  (35 frameworks total in the catalog).
- Each framework now carries a **source citation** and a **last-reviewed date**, shown on its detail page.
- Note: web tools are unavailable in this environment, so content was authored from authoritative
  knowledge with official-source citations (EUR-Lex / BaFin). Re-verify against live sources when possible.
  Files: `content/coreContent.seed.json`, `content/frameworks.seed.json`, `server/prisma/seed.js`.

### Start a checklist (manual activation)
- Classification now only auto-attaches templates flagged `autoActivate` (EU AI Act, GDPR, risk
  assessment), so sector frameworks are not forced onto every AI system.
- A new endpoint creates an organisation-level assessment from any checklist template, de-duplicated
  per org + template (+ system). The framework detail page has a **"Start this checklist"** button.
  Files: `server/controllers/compliance/assessmentController.js` (`start`), `server/routes/assessmentRoutes.js`,
  `server/validators/assessmentValidator.js`, `server/services/classification/classificationService.js`,
  `client/src/views/frameworks/FrameworkDetail.jsx`, `client/src/apis/assessmentApi.js`.

### Deferred from Phase 3
- Live-web research re-verification; questionnaire-driven sector auto-activation; framework version
  change-history; and a full admin authoring/editing UI. All tracked in `ROADMAP.md`.

---

## Phase 4 — Reporting and export (core)

Goal: produce evidence a regulator, auditor, or board will accept. Exit criteria met: a user can
generate an audit-ready PDF for any assessment and for the whole organisation.

### Server-side report generation (pdfkit)
- A reports module renders branded PDFs and CSVs and streams them as file downloads
  (`Content-Disposition: attachment`), guarded by the `export` permission.
  Files: `server/services/reports/reportService.js`, `server/controllers/reports/reportController.js`,
  `server/routes/reportRoutes.js`, `server/utils/csv.js`.

### What you can export
- **Assessment PDF** — title, framework, AI system, risk, status, progress, review dates, and every
  checklist item with its status, severity, assignee, documentation text, evidence file list and comment count.
- **Organisation compliance report PDF** — overall standing, counts, AI systems by risk, per-framework
  progress, and the full assessment list.
- **Organisation spreadsheet (CSV)** — one row per checklist item across the org (framework, assessment,
  item, status, severity, assignee, documented yes/no, updated date). Opens directly in Excel.
- **Audit log (CSV)** and an **Audit log page** with an action filter, showing who did what and when.
  Files: `server/controllers/compliance/auditController.js`, `server/routes/auditRoutes.js`,
  `client/src/views/audit/Audit.jsx`.
- **"Export applicable laws" (CSV)** from the Law Explorer, respecting the selected business functions.
  Files: `client/src/views/lawExplorer/LawExplorer.jsx`, `client/src/utils/download.js`.

### UI
- Export buttons on the dashboard (org PDF + CSV), the assessment editor (assessment PDF), the audit page
  (CSV), and the Law Explorer (applicable-laws CSV). A new **Audit log** item in the sidebar.
  Files: `client/src/views/dashboard/Dashboard.jsx`, `client/src/views/assessments/AssessmentEditor.jsx`,
  `client/src/apis/reportApi.js`, `client/src/apis/auditApi.js`, `client/src/components/Sidebar.jsx`.

### Deferred from Phase 4
- Dashboard score-over-time trends (needs a stored time-series), and scheduled monthly report emails.
- "Excel" is delivered as CSV for now; a true .xlsx export can be added later with a library.

---

## Tests

- Phase 1 kept all existing suites green (23 tests) while adding the hardening behaviours.
- Phase 2 added a **`collaboration`** suite (`e2e/tests/collaboration.spec.js`) that proves:
  1. Owner invites a teammate → teammate accepts in a separate browser session → comments on a shared assessment.
  2. Owner changes a member's role and removes them.
  3. Assignee + comment + activity on a checklist item, persisting across reload.
  4. A member is correctly blocked from member-management UI.
- Phase 3 added a **`contentDepth`** suite (`e2e/tests/contentDepth.spec.js`) that proves:
  1. Each of the five sector frameworks shows a checklist, source citation and review date.
  2. "Start this checklist" creates an organisation assessment that appears in the list.
  3. Starting the same checklist twice does not create a duplicate.
  4. Classifying an AI system does not auto-attach sector frameworks.
- Phase 4 added a **`reports`** suite (`e2e/tests/reports.spec.js`) that proves:
  1. An assessment exports as a PDF.
  2. The organisation report exports as PDF and CSV from the dashboard.
  3. The audit log lists actions and exports CSV.
  4. Applicable laws export as CSV from the Law Explorer.
- Full suite after Phase 4: **35 tests, all passing.**

Run them with:

```bash
cd e2e
npx playwright test
```
