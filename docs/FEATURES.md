# Features Reference

What every feature does, how it works under the hood, and concrete ideas to improve it.
This is a living document. Pair it with `ROADMAP.md`, which tracks the phased work.

Legend for improvement ideas: **[S]** small, **[M]** medium, **[L]** large effort.

---

## 1. Accounts and authentication

**What it does.** Users sign up with their name, email, company, and a password. They must
confirm their email through a link before they can sign in. Sessions are kept in a secure,
http-only cookie. Users can sign out, request a password reset, and set a new password.

**How it works.**
- Passwords are hashed with bcrypt (cost 12). The raw email/reset token is only sent in the
  email; only its SHA-256 hash is stored, with an expiry (24h verify, 1h reset).
- Login is blocked until the email is verified. The session is a JWT in an http-only,
  same-site cookie, so it is not readable by JavaScript.
- Key files: `server/controllers/identity/authController.js`, `server/services/auth/tokenService.js`,
  `server/middlewares/authHandler.js`, `client/src/views/auth/*`.

**Improvement ideas.**
- [S] Add a password strength meter and "show password" toggle on the forms.
- [S] Add a "resend verification email" button on the login error state.
- [M] Add refresh tokens with a short-lived access token for better session security.
- [M] Add rate limiting and lockout on login and password-reset endpoints.
- [L] Add SSO (Microsoft Entra / Google Workspace) for business customers.
- [L] Add two-factor authentication (TOTP).

---

## 2. Organisations, members, and roles

**What it does.** Each account belongs to one organisation (the tenant). The first user is the
owner. All data (AI systems, assessments, documents) is scoped to the organisation. Roles are
owner, admin, member, and platform_admin. Settings shows the organisation profile and member list.

**How it works.**
- Every tenant table carries `organizationId`; controllers scope all reads and writes by
  `req.organizationId`, set by the auth middleware.
- `requireRole(...)` guards admin-only and org-mutating routes.
- Key files: `server/controllers/identity/organizationController.js`, `server/middlewares/authHandler.js`,
  `client/src/views/settings/Settings.jsx`.

**Improvement ideas.**
- [M] Member invitations by email (invite, accept, set role) instead of single-owner only.
- [M] A proper roles-and-permissions matrix (who can edit vs view vs export).
- [S] Let admins change a member's role from the members table (API exists, add the UI control).
- [L] Multiple organisations per user with an organisation switcher.

---

## 3. Dashboard

**What it does.** A single overview of where the organisation stands: an overall compliance
score, counts (AI systems, assessments, reviews due, open items), AI risk distribution,
per-framework progress, upcoming and overdue reviews, open items by severity, and recent activity.

**How it works.**
- One aggregation endpoint (`GET /api/dashboard/summary`) computes everything in a few queries.
- Widgets live in `client/src/components/dashboard/widgets.jsx`; the page is `client/src/views/dashboard/Dashboard.jsx`.

**Improvement ideas.**
- [S] Make each stat tile clickable, deep-linking to a filtered list.
- [M] Add a date filter and trend lines (score over time) using a small chart library.
- [M] Add an "next best actions" panel that lists the highest-impact open items.
- [L] Configurable dashboard (drag to reorder or hide widgets) saved per user.

---

## 4. Law Explorer (interactive)

**What it does.** An educational map of the EU and German laws that govern AI. Users browse all
laws grouped by tier (EU, German national, sector), search them, select what their company does
to highlight the laws that likely apply, and open a detail drawer per law (plain-language
summary, who must comply, the German regulator, key sections, official source link, and a link
to start its checklist).

**How it works.**
- `GET /api/laws` returns the published frameworks plus the business-function questionnaire and
  the applicability matrix (authored as data in `content/applicability.json`).
- Selecting functions computes the set of applicable framework keys client-side and highlights them.
- Key files: `client/src/views/lawExplorer/LawExplorer.jsx`, `server/controllers/catalog/lawController.js`.

**Improvement ideas.**
- [S] Add a "print / export my applicable laws" summary.
- [S] Show a count and quick filter chips per tier and per sector.
- [M] Let users save their answers so the highlighted set persists across visits.
- [M] Add a confidence note and a short "why this applies" line per highlighted law.
- [L] Turn the questionnaire into a guided wizard that also pre-creates the relevant assessments.

---

## 5. Frameworks library

**What it does.** A reference list of every regulatory framework tracked in the app. Each
framework detail page shows its requirements in plain language (with severity and law links) and
the checklists built from it.

**How it works.**
- Catalog data is rows: `Framework`, `Requirement`, `ChecklistTemplate`, `TemplateItem`.
- Key files: `client/src/views/frameworks/*`, `server/controllers/catalog/frameworkController.js`.

**Improvement ideas.**
- [M] Author full checklists for the frameworks that currently only have catalog metadata
  (DORA, NIS2, BaFin, and the rest). See ROADMAP Phase 3.
- [S] Add a tier and category filter to the frameworks table.
- [M] Framework versioning with an effective-date timeline and change history.

---

## 6. AI systems and risk classification

**What it does.** Users register each AI system their company uses or builds, then answer a short
questionnaire. The app classifies the system into an EU AI Act risk level (prohibited, high,
limited, minimal) and automatically creates the right checklists and an annual reminder for each.

**How it works.**
- A data-driven rule engine evaluates a small boolean condition language against the answers, in
  priority order, first match wins (`server/services/classification/classificationService.js`).
- Classification then instantiates one assessment per matching checklist template plus a response
  row per item, and a reminder schedule.
- Questions and rules are data (`content/classification.seed.json`), so they can change without code.
- Key files: `client/src/views/aiSystems/*`, `server/controllers/compliance/aiSystemController.js`.

**Improvement ideas.**
- [S] Let users re-run classification when the system changes, with a record of what changed.
- [M] Show the user which answer led to which result (explainable trace from the matched rule).
- [M] Support multi-select and scaled questions, not only yes/no.
- [L] Add an AI assistant that drafts the system description and suggests answers from a short prompt.

---

## 7. Assessments and documentation

**What it does.** Each assessment is a checklist for one AI system against one framework. For each
item the user sets a status (not started, in progress, done, not applicable), writes their
documentation or risk assessment in a text field, and attaches evidence files. Progress is
tracked, required items must be documented before they can be marked done, and "mark reviewed"
resets the annual review date.

**How it works.**
- Saving an item recomputes the assessment progress and status server-side.
- Key files: `client/src/views/assessments/AssessmentEditor.jsx`,
  `client/src/components/assessments/ChecklistItem.jsx`,
  `server/controllers/compliance/assessmentController.js` and `checklistResponseController.js`.

**Improvement ideas.**
- [S] Autosave on blur with a debounced indicator, instead of a per-item Save button.
- [M] Rich-text editor (headings, lists, links) for documentation fields.
- [M] Comments and an assignee per item so teams can collaborate.
- [M] Version history of responses so you can see who changed what and when.
- [L] Suggested answer text per item, drafted by an AI model from the system details.

---

## 8. Documents and evidence

**What it does.** Upload evidence files, list them, download them, and delete them. Files can be
attached to a checklist item or kept in the general document library.

**How it works.**
- Multer stores files on local disk in development; the document row records the storage key.
- Key files: `client/src/views/documents/Documents.jsx`, `server/controllers/compliance/documentController.js`,
  `server/config/upload.js`.

**Improvement ideas.**
- [M] Move storage to S3-compatible object storage for production, with signed download URLs.
- [S] Validate file types and show upload progress and a friendly size limit message.
- [M] Document versioning and an expiry/review date per document.
- [M] Virus scanning on upload.

---

## 9. Notifications

**What it does.** An in-app notification bell with an unread count and a dropdown, plus a full
notifications page. Reminders and system messages appear here; users can open, mark read, or mark
all read.

**How it works.**
- The bell polls the unread count every 60 seconds; notifications are created by the reminder job.
- Key files: `client/src/components/NotificationBell.jsx`, `client/src/views/notifications/Notifications.jsx`,
  `server/controllers/engagement/notificationController.js`.

**Improvement ideas.**
- [S] Group notifications by type and add a "review due" filter.
- [M] Replace polling with server-sent events or websockets for instant updates.
- [M] Notification preferences (which events, email vs in-app) per user.

---

## 10. Annual review reminders

**What it does.** Every assessment gets an annual review reminder. A daily job raises an in-app
notification and sends an email when a review is due, and flags the assessment as needs review.
Marking an assessment reviewed pushes the next review out a year.

**How it works.**
- A single node-cron job runs daily, queries due reminders, and processes them. The job can also
  be triggered with a forced clock for testing (`POST /api/reminders/run-due`).
- Key files: `server/services/reminders/reminderScheduler.js` and `reminderService.js`.

**Improvement ideas.**
- [S] Configurable cadence and lead time per assessment in the UI (the data model already supports it).
- [M] A weekly digest email summarising everything due in the next 30 days.
- [M] Escalation: if a review is overdue by N days, notify admins.
- [L] Move the job to a durable queue (BullMQ + Redis) when volume grows.

---

## 11. Catalog administration (expandability)

**What it does.** Platform admins add a brand new area of law from the UI. Creating a framework
also creates a starter checklist. The new framework appears in the Law Explorer, the Frameworks
library, the risk-based checklist generation, the dashboard, and the reminders, with no code change.

**How it works.**
- All catalog content is data. The admin endpoints insert framework, requirement, template, and
  item rows. Generic UI and endpoints render whatever exists.
- Key files: `client/src/views/admin/Admin.jsx`, `server/controllers/admin/adminController.js`.

**Improvement ideas.**
- [M] A full authoring UI: edit requirements, templates, items, questionnaires, and rules (not just create).
- [M] Draft vs published workflow with preview before going live.
- [S] Import/export a framework as JSON to share between environments.
- [L] A rules builder UI for the classification engine (no JSON editing).

---

## 12. Cross-cutting

**Audit log.** Every important action (login, classify, document upload, etc.) is recorded in an
append-only audit log shown on the dashboard. Improvement: [M] a full audit log page with filters
and export.

**Security.** http-only same-site cookie sessions, bcrypt, tenant scoping, role guards, Zod
validation on every input. Improvement: [M] rate limiting, security headers (helmet), CSRF token
for non-cookie flows, [L] penetration test before production.

**Design system.** Soft-minimal theme defined once in `client/src/styles/global.css` (indigo
accent, soft cards, rounded corners). Improvement: [S] a dark mode, [M] a shared component
library and Storybook, [M] full mobile responsiveness pass, [M] accessibility (WCAG) audit.

**Email.** Console transport by default (links printed to logs); set `EMAIL_PREVIEW=true` for
Ethereal preview URLs. Improvement: [M] wire real SMTP/SES for production with templates.

**Content accuracy.** Catalog seeded from the verified 32-law PDF plus knowledge-based additions.
Improvement: [M] re-run deep research with web access enabled to verify dates and add new laws;
[S] add a "last reviewed" date and source citation per framework.
