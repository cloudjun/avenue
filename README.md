# Avenue

The #1 AI note-taking app that becomes your second brain.

## Repository structure

```
avenue/
├── apps/
│   ├── api/                # Fastify API for note ingest/retrieval + auth
│   └── web/                # Next.js 14 app (App Router)
├── packages/
│   ├── ai/                 # Chunking, embedding, retrieval pipeline
│   ├── db/                 # Drizzle ORM schema and migrations (Postgres)
│   └── logger/             # Shared pino structured logger
├── .github/
│   └── workflows/ci.yml    # Lint + type-check + test on every PR
├── setup.sh                # Reproducible dev environment setup
├── .env.example            # Required environment variables
└── pnpm-workspace.yaml     # Monorepo workspace config
```

## Tech stack

| Layer        | Choice              | Why                                              |
| ------------ | ------------------- | ------------------------------------------------ |
| Framework    | Next.js 14          | Full-stack, file-router, edge-ready              |
| Language     | TypeScript strict   | Type safety across the AI pipeline               |
| Database     | PostgreSQL + pgvector | Relational + vector search in one store        |
| ORM          | Drizzle             | Type-safe SQL, lightweight, fast migrations      |
| AI           | Anthropic Claude    | Best-in-class reasoning for recall and enrichment|
| Error track  | Sentry              | Real-time errors + session replay                |
| Logging      | pino                | Structured JSON logs, fast, redacts secrets      |
| Package mgr  | pnpm                | Fast, disk-efficient, workspace support          |

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ with pgvector extension (or a [Supabase](https://supabase.com) project)

### One-shot setup

```bash
./setup.sh
```

This installs dependencies, copies `.env.example` → `.env.local`, and runs migrations.

### Manual steps

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local with your secrets
pnpm db:generate   # generate migration SQL
pnpm db:migrate    # apply migrations
pnpm api:dev       # start API server on http://localhost:4000
pnpm dev           # start Next.js dev server on http://localhost:3000
```

## Board run/test checklist

Use this when you need a fast confidence check before a board review.

### 1) Boot the stack

```bash
pnpm install
cp .env.example .env.local
# Fill in DATABASE_URL, ANTHROPIC_API_KEY, OPENAI_API_KEY, JWT_SECRET

pnpm db:migrate
PORT=4000 pnpm api:dev
```

In a second terminal:

```bash
pnpm dev
```

Expected:

- API responds at `http://localhost:4000/health` with `{"ok":true}`
- Web responds at `http://localhost:3000`

### 1.1) Use the functional web UI

The home page (`apps/web/app/page.tsx`) now provides:

- Account bootstrap (`register` + `login`) against `/auth/register` and `/auth/login`
- Note creation with text, optional title, and optional source URL
- Notes list refresh via `GET /notes`
- Hybrid search via `GET /notes/search?mode=hybrid`

Usage flow:

1. Open `http://localhost:3000`.
2. Register with an email + password (or login with an existing account).
3. Create one or more notes in the **Create note** panel.
4. Use **Hybrid search** to query semantically/keyword-ranked results.
5. Use **Refresh** in **Notes list** to pull the latest saved notes.

If your API is not on `http://localhost:4000`, set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` for `apps/web`.

### 2) Run the automated test gates

```bash
pnpm lint
pnpm type-check
pnpm test
```

Expected:

- Lint exits `0`
- Type-check exits `0`
- Vitest passes in `apps/api`, `packages/ai`, `packages/logger`, and `apps/web`

### 3) Run a minimal API smoke test

```bash
curl -s http://localhost:4000/health
```

Expected:

```json
{"ok":true}
```

Optional deeper check (requires API env vars and a running database):

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"board-smoke@example.com","password":"board-smoke-pass-123"}' | jq -r '.token')

curl -s -X POST http://localhost:4000/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Board smoke test note"}'
```

Expected:

- Returns a note id and persisted note payload
- Background AI pipeline runs asynchronously and does not block write acknowledgement

## Web note-taking UI (AVE-13)

The home page at `apps/web/app/page.tsx` now provides a basic functional note UI wired to the existing API.

### What it supports

- Account bootstrap in-app (register) to get a JWT session token
- Create notes with plain text content and optional title
- Create notes with optional `source_url` (URL enrichment remains async in API)
- List existing notes for the signed-in user
- Hybrid semantic/keyword search via `/notes/search?mode=hybrid`
- Delete notes

### How to use

1. Start API (`PORT=4000 pnpm api:dev`) and web (`pnpm dev`).
2. Open `http://localhost:3000`.
3. Create an account in the UI to start a session.
4. Create notes in the composer (text required, URL optional).
5. Use the search bar to run hybrid retrieval over your notes.
6. Delete notes from the list when needed.

### API integration details

The web app calls same-origin Next.js route handlers that proxy to the Fastify API:

- `POST /api/auth/register` -> `POST /auth/register`
- `GET /api/notes` -> `GET /notes`
- `POST /api/notes` -> `POST /notes`
- `GET /api/notes/search` -> `GET /notes/search`
- `DELETE /api/notes/:id` -> `DELETE /notes/:id`

Server-side proxying avoids browser CORS coupling and keeps backend host configuration in one place (`AVENUE_API_URL`, default `http://localhost:4000`).

## CI

GitHub Actions runs on every push and PR:

- **Lint** — ESLint across all packages
- **Type check** — `tsc --noEmit` across all packages
- **Test** — Vitest unit tests across all packages

See `.github/workflows/ci.yml`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable                    | Required | Description                                  |
| --------------------------- | -------- | -------------------------------------------- |
| `DATABASE_URL`              | Yes      | Postgres connection string                   |
| `ANTHROPIC_API_KEY`         | Yes      | Anthropic Claude API key                     |
| `NEXT_PUBLIC_SENTRY_DSN`    | No       | Sentry DSN (errors suppressed without it)    |
| `SENTRY_AUTH_TOKEN`         | No       | Sentry upload auth (needed for source maps)  |
| `LOG_LEVEL`                 | No       | `debug` / `info` / `warn` (default: `info`)  |

## Staging / preview environment

Preview deployments are provided by **Vercel** — every PR gets an ephemeral URL automatically when the repo is connected to Vercel. Database preview branches use **Supabase branching** (one branch per PR).

### Provisioning checklist (one-time, done by CTO)

- [ ] Create Supabase project → copy `DATABASE_URL` to Vercel env vars
- [ ] Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] Import repo to Vercel; set `ANTHROPIC_API_KEY` + `NEXT_PUBLIC_SENTRY_DSN` as encrypted secrets
- [ ] Create Sentry project `web` under org `avenue`; add `SENTRY_AUTH_TOKEN` to Vercel
- [ ] Add `DATABASE_URL` to GitHub Actions secrets for integration tests

## Observability

- **Error tracking**: Sentry (client + server + edge) — see `apps/web/sentry.*.config.ts`
- **Structured logging**: pino via `@avenue/logger` — JSON in production, pretty-printed in dev
- All server logs include `service`, `env`, and can be extended with `childLogger({ requestId, userId })`
- Sensitive fields (`authorization`, `cookie`, `password`, `token`) are automatically redacted

## AI processing cost (AVE-4)

Per-note AI processing stores an estimated cost in `notes.metadata.aiPipeline.estimatedCostUsd`.

- Embeddings: `text-embedding-3-small` at `$0.00002 / 1K` input tokens
- Tagging input: `claude-haiku-4-5-20251001` at `$0.0008 / 1K` input tokens
- Tagging output: `claude-haiku-4-5-20251001` at `$0.004 / 1K` output tokens

Token estimation uses `~1 token = 4 characters` for deterministic accounting in the async pipeline. Update the constants in `apps/api/src/lib/ai-pipeline.ts` if provider pricing changes.

## Architecture decisions

- **Monorepo with pnpm workspaces**: avoids duplication of TS config, linting, and shared packages across apps
- **Drizzle over Prisma**: Drizzle generates plain SQL migrations (reviewable, portable); Prisma's binary engine adds overhead we don't need
- **pgvector over Pinecone/Weaviate**: one fewer managed service; Supabase bundles pgvector; avoids vendor lock-in
- **Pino over Winston**: 5-8× faster, smaller bundle, better structured output for cloud log aggregators
- **AI pipeline in a separate package**: keeps the retrieval logic testable without spinning up Next.js; makes it easy to move to a worker/queue later

- [ ] AVE-6 preview deployment verification marker (2026-04-29T05:28:53Z)
