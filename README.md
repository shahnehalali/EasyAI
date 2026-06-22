# Easy AI - Compliance Platform for Companies in Germany

A professional web application that helps companies in Germany meet their regulatory
requirements for using Artificial Intelligence. Companies register, classify their AI
systems by risk, work through plain-language compliance checklists, document their risk
assessments, and get reminded to review yearly. The system is built to expand to new areas
of law (BaFin, cloud exit, and more) by adding **data**, not rewriting code.

It is the operational companion to the static guide `Germany_AI_Regulation_Guide.pdf`.

## Documentation

- `docs/FEATURES.md` - every feature, what it does, how it works, and improvement ideas.
- `docs/ROADMAP.md` - phased plan and progress tracker with checkboxes.
- `docs/PHASES-COMPLETED.md` - summary of the work delivered in Phase 1 and Phase 2.

## What it does

- **Email-verified accounts.** Register, verify by email link, sign in (session in an httpOnly cookie).
- **Unique legal/authority dashboard.** Compliance standing, AI risk overview, framework progress, upcoming reviews, open items by severity, and recent activity. Flat design, no gradients.
- **Interactive Law Explorer.** A visual answer to "which laws govern AI in Germany?" Browse 34 EU and German laws by tier, use the "does this apply to me?" questionnaire to highlight the laws that apply to your business, and open a plain-language detail drawer for each (what it means, who must comply, the German regulator, key sections, official source).
- **AI system registration and risk classification.** A short questionnaire places each system into the EU AI Act risk levels (prohibited, high, limited, minimal) using a data-driven rule engine, then auto-creates the right checklists.
- **Assessments with documentation.** Per-item status, free-text fields for documentation and risk assessments, attach evidence files, and progress tracking.
- **Annual review reminders.** A daily job raises in-app notifications and emails when a review is due, and flags the assessment for review.
- **Admin authoring.** Platform admins add a brand new framework (with a starter checklist) from the UI. It appears in the Law Explorer and Frameworks immediately, with no code change. This is the expandability guarantee in action.

## Tech stack

- **Server:** Node.js, Express, Prisma, PostgreSQL, Zod, JWT (cookie), bcrypt, Nodemailer, node-cron, multer.
- **Client:** React, Vite, React Router, TanStack Query, Zustand, React Hook Form (JavaScript, no TypeScript).
- **Tests:** Playwright end-to-end, one suite per module.

The codebase follows the project convention of sibling `server/` and `client/` folders, a centralized logger, `routes -> validators -> controllers -> services -> models` layering, and one router/controller/validator per resource.

## Project layout

```
server/    Express API + Prisma schema + seed
client/    React single-page app
e2e/       Playwright tests (one spec per module)
content/   Seed data: the law catalog as JSON (frameworks, requirements, checklists, classification, applicability matrix)
```

## Prerequisites

- Node.js 18+ (built and tested on Node 22)
- Docker Desktop (to run PostgreSQL), or a local PostgreSQL on the connection string in `server/.env`

## Setup and run

From the project root:

```bash
# 1. Start PostgreSQL (host port 5433, matches server/.env)
docker compose up -d

# 2. Server
cd server
npm install
npx prisma migrate dev --name init   # or: npx prisma db push
npm run seed                          # loads the law catalog + demo accounts
npm run dev                           # http://localhost:4000

# 3. Client (new terminal)
cd client
npm install
npm run dev                           # http://localhost:5173
```

Open http://localhost:5173.

### Demo accounts (created by the seed)

- Owner: `demo@aicompliance.local` / `Demo12345!`
- Platform admin (catalog authoring): `admin@aicompliance.local` / `Admin12345!`

### Email in development

If `SMTP_HOST` is blank, the server creates an Ethereal test inbox and prints a **preview URL** in its logs for every email (verification, password reset, reminders). Open that URL to see the message and click the link.

## Tests

```bash
cd e2e
npm install
npx playwright install        # one-time browser download
npx playwright test           # runs all module suites
```

The Playwright config starts the server and client automatically and a global setup applies the schema and seed. PostgreSQL must be running first (`docker compose up -d`).

Suites: `auth`, `organizations`, `frameworks`, `lawExplorer`, `aiSystems`, `assessments`, `documents`, `reminders`, `dashboard`, `admin`.

## How expansion works (no schema change)

Frameworks, requirements, checklist templates, questionnaire questions, and classification
rules are all rows. To add a new area of law (for example BaFin or DORA checklists):

1. Sign in as a platform admin and open **Catalog Admin**, or add entries to the JSON files in `content/` and re-run `npm run seed`.
2. Create the framework and its checklist items.
3. It appears immediately in the Law Explorer, the Frameworks library, the risk-based checklist generation, the dashboard, and the reminder system.

The `admin` Playwright suite proves this end to end by creating a new BaFin framework through the UI and asserting it shows up across the app.

## Notes

This software is an orientation and workflow tool. It is not legal advice. Always verify
against the official sources and obtain qualified legal counsel before relying on any item
for a compliance decision.
