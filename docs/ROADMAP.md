# Roadmap and Progress Tracker

A phased plan for the AI Compliance platform. Use the checkboxes to track work.
Tick `- [x]` when done. Each phase has a goal, tasks, and a "done when" exit check.

Pair this with `FEATURES.md`, which describes what each feature does and lists the
improvement ideas these phases draw from.

**Status key:** ✅ done · 🔶 in progress · ⬜ not started
**Effort:** S small · M medium · L large

---

## Phase 0 — MVP foundation ✅ (complete)

Goal: a working, tested product that proves the concept end to end.

- [x] Monorepo scaffold (server, client, e2e, content) with project conventions
- [x] PostgreSQL data model (catalog vs tenant split) via Prisma
- [x] Email-verified auth (register, verify, login, logout, reset) with cookie sessions
- [x] Organisations, members, roles, tenant scoping
- [x] Dashboard with compliance standing and widgets
- [x] Interactive Law Explorer (34 laws, applicability questionnaire, detail drawer)
- [x] Frameworks library (catalog + plain-language requirements)
- [x] AI system registration and data-driven risk classification
- [x] Assessments with documentation fields, status, progress, evidence upload
- [x] Documents library
- [x] In-app notifications + annual review reminders (cron + email)
- [x] Admin catalog authoring (expandability proof)
- [x] Soft-minimal design system (indigo, soft cards, rounded)
- [x] Playwright e2e: one suite per module (23 tests passing)
- [x] README and developer docs

Done when: the full flow (register → verify → classify → document → reminder) works and tests are green. ✅

---

## Phase 1 — Hardening and polish ✅ (complete)

Goal: make the MVP feel production-grade and reliable.

- [x] [S] Autosave checklist responses on blur and on status change, with a saving indicator
- [x] [S] Password strength meter + show/hide toggle on auth forms
- [x] [S] "Resend verification email" action on the login error
- [x] [M] Friendly error states (retry) and loading skeletons across all pages
- [x] [M] Mobile-responsive pass (off-canvas sidebar with hamburger, scrollable tables)
- [x] [M] Accessibility pass (focus-visible ring, skip link, aria labels, dialog role, associated labels)
- [x] [M] Rate limiting + per-account login lockout on auth endpoints (express-rate-limit)
- [x] [M] Security headers via helmet
- [x] [S] Friendly 404 page and React error boundary
- [x] [S] Loading skeletons instead of plain "Loading..."

Done when: the app works on mobile, has visible focus and skip navigation, auth endpoints are
rate limited, and errors no longer blank the screen. ✅ (all 23 e2e tests still green)

Follow-ups deferred to later phases: a full WCAG audit (Phase 6), tables-to-cards reflow on
very small screens, and input hardening review alongside the pen test (Phase 6).

---

## Phase 2 — Collaboration and roles ✅ (complete)

Goal: let real teams work together, not just a single owner.

- [x] [M] Member invitations by email (invite, accept, set role) with a shareable link fallback
- [x] [M] Roles-and-permissions matrix (members.manage / org.manage / compliance.edit / export / catalog.manage),
  enforced server-side and reflected in the UI; permissions returned on the session
- [x] [S] Change member role and remove members from the members table (with last-owner guards)
- [x] [M] Assign an owner and comment per checklist item (threaded comments)
- [x] [M] Activity per assessment (who changed what, when) shown in an activity panel
- [~] [L] Multiple organisations per user with an organisation switcher — DEFERRED (large; current
  model is one org per user). Tracked as a future item; not needed for the Phase 2 exit criteria.

Done when: a second teammate can be invited, given a role, and collaborate on an assessment. ✅
(Proven by the `collaboration` e2e suite: invite → accept in a separate session → comment on a shared
assessment; role change + remove; assignee/comment/activity; member cannot manage members.)

---

## Phase 3 — Content depth ✅ (core complete)

Goal: turn catalog-only frameworks into fully usable checklists, verified.

- [x] [M] Author full checklists for DORA, NIS2, BaFin, Data Act, CRA (5 sector frameworks, authored as data)
- [x] [S] "Last reviewed" date and source citation per framework (shown on the framework detail)
- [x] [M] Sector frameworks usable via a manual "Start this checklist" action (org-level assessment),
  with `autoActivate=false` so they are not forced onto every classification
- [~] [M] Re-run deep research with web access — web tools are unavailable in this environment, so content
  was authored from authoritative knowledge with official-source citations per framework. Re-verify with
  live web access when available. DEFERRED (verification step).
- [~] [M] Sector questionnaires that auto-activate sector frameworks — replaced for now by manual start;
  questionnaire-driven auto-activation DEFERRED.
- [~] [M] Framework versioning with effective dates and change history — frameworks carry version /
  effectiveFrom / lastReviewedAt and these are shown; a full change-history table is DEFERRED.
- [~] [M] Full admin authoring UI (edit requirements, items, questions, rules) — admins can create a
  framework + starter checklist today; a full editing UI is DEFERRED.

Done when: at least five additional frameworks have working, verified checklists authored as data. ✅
(DORA, NIS2, Data Act, CRA, BaFin — each browsable with requirements, a checklist, citation and review
date, and a working "Start this checklist". Proven by the `contentDepth` e2e suite.)

---

## Phase 4 — Reporting and export ✅ (core complete)

Goal: produce evidence a regulator, auditor, or board will accept.

- [x] [M] Export an assessment as a branded PDF (status, responses, evidence, assignee, comments) — pdfkit
- [x] [M] Organisation-wide compliance report as PDF, plus a spreadsheet export as CSV (Excel-compatible)
- [x] [M] Audit log page with an action filter and CSV export
- [x] [S] "Export my applicable laws" from the Law Explorer (CSV, respects the selected functions)
- [x] [M] Dashboard trends (score over time) — `ComplianceSnapshot` time-series, a daily snapshot job,
  ~30 days backfilled for the demo org, and a dependency-free SVG line chart on the dashboard
- [x] [L] Scheduled report emails (monthly compliance summary) — monthly cron + email template +
  in-app notification, with a forced-run endpoint for testing

Done when: a user can generate an audit-ready PDF for any assessment and the whole organisation. ✅
(Proven by the `reports` e2e suite: assessment PDF, organisation PDF + CSV, audit CSV, and applicable-laws CSV.
The `trends` e2e suite covers the score-over-time chart and the monthly report.)

Phase 4 is now fully complete (no deferred items).

Note: "Excel" is delivered as CSV (opens directly in Excel) to avoid a heavy dependency; a true .xlsx
export can be added later with a library such as exceljs if needed.

---

## Phase 5 — Integrations and automation ⬜

Goal: connect to the systems companies already use.

- [ ] [M] Real SMTP / SES email with templates for production
- [ ] [M] S3-compatible document storage with signed URLs
- [ ] [L] SSO (Microsoft Entra, Google Workspace)
- [ ] [M] Webhooks / API keys for external systems
- [ ] [M] Calendar integration for review due dates (ICS feed)
- [ ] [L] AI assistant: draft documentation and suggest classification answers

Done when: production email and file storage are live and at least one external integration works.

---

## Phase 6 — Scale, operations, and localisation ⬜

Goal: run reliably for many customers.

- [ ] [M] CI pipeline (lint, tests, build) on every push
- [ ] [M] Containerised deployment (Docker images for server and client)
- [ ] [M] Monitoring, error tracking, and structured logs
- [ ] [M] Automated database backups and a restore runbook
- [ ] [L] German and English UI (i18n); content in both languages
- [ ] [M] Move reminders to a durable queue (BullMQ + Redis) at volume
- [ ] [L] Security review / penetration test before go-live

Done when: there is CI, monitoring, backups, and a documented deploy, and the UI is bilingual.

---

## Sub-project: Law Explorer v2

Goal: turn the Law Explorer from an educational catalogue into a personalised, well-explained,
actionable compliance map.

### Phase LE-1 — Explain the laws really well ✅ (complete)

- [x] [M] Richer law content: "in plain terms", "what you must do" (practical steps),
  "key dates / deadlines", "penalties", who must comply, who enforces it, and source per law
- [x] [M] Authored high-quality plain-language explanations for all 35 frameworks (no jargon, no long dashes)
- [x] [M] Redesigned the law detail drawer to present these as clear, scannable sections
  (plain terms, a highlighted "what you must do" list, key dates, a penalties box, regulator, sections, source)
- [x] [S] Shows the "content reviewed" date and a clear "not legal advice" note in the drawer

Done when: opening any law shows a clear, plain-language explanation with what you must do, key dates and
penalties. ✅ (Covered by the updated `lawExplorer` e2e test; full suite 38 tests, all green.)

### Phase LE-2 — Make it personal and actionable ✅ (complete)

- [x] [M] Persist the "what does your company do?" answers on the organisation (saved across visits and devices)
- [x] [M] Greatly expanded the "Does this apply to me?" scope: ~30 business functions grouped into
  six categories (data and privacy, people and work, content and AI building, platforms and markets,
  products and safety, your sector)
- [x] [S] "Why does this apply?" reason in the drawer (lists the functions you selected that triggered it)
- [x] [M] Coverage status: each applicable law shows "Checklist started / Not started", plus an
  "X of Y started" count in the result banner
- [x] [M] "Start checklists for my applicable laws" bulk action (creates org-level assessments, de-duplicated)
- [x] [M] Pre-fill applicability from the org industry and size on first visit

Done when: the questionnaire is broad, your answers stick, and you can see and act on your applicable laws. ✅
(Covered by the `lawExplorer` e2e tests; full suite now 41 tests, all green.)

### Phase LE-3 — Better filtering and reference ✅ (complete)

- [x] [S] Filter by jurisdiction (EU/DE), topic/category, regulator (via search), and "has a checklist",
  with a live match count and clear-filters action
- [x] [M] Related-laws cross-links in the drawer (e.g. GDPR <-> BDSG <-> TDDDG), authored in
  `content/lawRelations.json`; clicking one opens that law
- [x] [S] Watch-list section of pending/draft laws (KI-MIG, deepfake law, employee-data act),
  clearly marked "in development / not yet in force"
- [x] [M] Compliance deadline timeline (AI Act phases, CRA, Machinery, Product Liability, NIS2, Data Act),
  past vs upcoming, authored in `content/timeline.json`

Done when: users can filter the catalogue, jump between related laws, see what is coming, and plan around
deadlines. ✅ (Covered by the `lawExplorer` e2e tests; full suite now 44 tests, all green.)

### Phase LE-4 — Reach and guidance ✅ (complete)

- [x] [L] English/German content toggle: a language switch (saved per browser) that translates the
  Law Explorer UI, the questionnaire, and all 35 laws' content (name, summary, what-to-do, dates,
  penalties, regulator) into German. German text is plain-language and should be reviewed by a
  native/legal speaker before being relied on.
- [x] [M] Guided wizard: a step-by-step flow through the question categories ending in a personalised
  result list with a "start checklists for all of these" action.
- [x] [L] Natural-language "describe your AI use": a free-text box that maps a company description to the
  applicable functions/laws. Uses the Claude API when `ANTHROPIC_API_KEY` is set, otherwise a built-in
  keyword matcher (so it works offline and in tests).

Done when: the Law Explorer is available in German, can be driven by a guided wizard, and accepts a
free-text description. ✅ (Covered by the `lawExplorer` e2e tests; full suite now 47 tests, all green.)
Law Explorer v2 (LE-1 to LE-4) is now fully complete.

---

## How to use this tracker

- Work top-down: finish Phase 1 before starting Phase 2 unless a later item is urgent.
- When you pick up a task, change its line to in progress and add your initials, e.g.
  `- [ ] [M] ... (🔶 AB)`. Tick `- [x]` when merged and verified.
- Keep `FEATURES.md` in sync: when a feature changes, update its description and prune the
  improvement idea you completed.
- Add a dated line to the changelog below for anything notable.

## Changelog

- 2026-06-09 — Phase 0 completed. MVP built and tested (23 e2e tests passing). Soft-minimal redesign applied.
- 2026-06-09 — Phase 1 completed. Hardening and polish: autosave, password UX, resend verification,
  skeletons, error states, error boundary, 404, mobile sidebar, accessibility pass, helmet, rate limiting.
  All 23 e2e tests still green.
- 2026-06-10 — Phase 2 completed. Collaboration and roles: email invitations + accept flow, permissions
  matrix, member role change/remove, per-item assignees and comments, assessment activity feed.
  New `collaboration` e2e suite added; full suite now 27 tests, all green. Multi-org switcher deferred.
- 2026-06-10 — Phase 3 core completed. Content depth: full authored checklists for DORA, NIS2, Data Act,
  CRA and a new BaFin framework (35 frameworks total); per-framework source citation + last-reviewed date;
  `autoActivate` flag and a manual "Start this checklist" flow so sector checklists are not forced onto
  every classification. New `contentDepth` e2e suite; full suite now 31 tests, all green. Deferred:
  live-web research re-verification, questionnaire-driven sector activation, version change-history, full admin editor.
- 2026-06-10 — Phase 4 core completed. Reporting and export: branded assessment PDF, organisation
  compliance PDF, organisation CSV, audit-log page with filter + CSV, and Law Explorer applicable-laws CSV
  (pdfkit on the server). New `reports` e2e suite; full suite now 35 tests, all green. Deferred:
  dashboard score-over-time trends and scheduled report emails.
- 2026-06-10 — Phase 4 fully completed. Added the two deferred items: a compliance-score time-series
  (`ComplianceSnapshot` + daily snapshot job + 30-day demo backfill + SVG trend chart) and a monthly
  compliance-summary email (cron + template + in-app notification + forced-run endpoint). New `trends`
  e2e suite; full suite now 38 tests, all green.
- 2026-06-12 — Law Explorer v2, Phase LE-1 completed. Every law now has rich plain-language content
  ("what you must do", key dates, penalties) authored for all 35 frameworks, and a redesigned detail
  drawer that presents it as clear sections with a "content reviewed" date and disclaimer. Updated
  `lawExplorer` e2e test; full suite 38 tests, all green.
- 2026-06-15 — Law Explorer v2, Phase LE-2 completed. Expanded the "Does this apply to me?" questionnaire
  to ~30 functions in six categories; answers now persist on the organisation and pre-fill from industry
  and size; the drawer explains why a law applies; each applicable law shows checklist coverage; and a
  one-click bulk action starts checklists for all applicable laws. New LE-2 e2e tests; full suite 41, all green.
- 2026-06-15 — Fixed a real bug: admin-created starter checklists defaulted to auto-activate and (because
  the catalog is global) were attaching to every classified AI system, producing duplicate "BaFin AI"
  assessments with no description. Admin checklists are now manual; removed 11 orphan test frameworks and
  ~736 phantom assessments; added a Playwright global teardown that auto-cleans test frameworks. Also
  redesigned the Assessments table (grouped by AI system / organisation-wide, with summary and item counts).
- 2026-06-15 — Law Explorer v2, Phase LE-3 completed. Added filters (jurisdiction, topic, regulator search,
  has-a-checklist), related-law cross-links in the drawer, a watch-list of pending/draft laws, and a
  compliance deadline timeline. New LE-3 e2e tests; full suite now 44 tests, all green.
- 2026-06-15 — Law Explorer v2, Phase LE-4 completed (and Law Explorer v2 finished). Added an English/German
  toggle that translates the UI, questionnaire and all 35 laws' content into German; a guided step-by-step
  wizard ending in a personalised result; and a natural-language "describe your AI use" box (Claude API with
  an offline keyword fallback). New LE-4 e2e tests; full suite now 47 tests, all green. German content is
  plain-language and flagged for native/legal review.
