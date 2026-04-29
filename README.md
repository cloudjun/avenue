# Avenue

The #1 AI note-taking app that becomes your second brain.

## Repository structure

```
avenue/
├── apps/
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
pnpm dev           # start Next.js dev server on http://localhost:3000
```

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

## Architecture decisions

- **Monorepo with pnpm workspaces**: avoids duplication of TS config, linting, and shared packages across apps
- **Drizzle over Prisma**: Drizzle generates plain SQL migrations (reviewable, portable); Prisma's binary engine adds overhead we don't need
- **pgvector over Pinecone/Weaviate**: one fewer managed service; Supabase bundles pgvector; avoids vendor lock-in
- **Pino over Winston**: 5-8× faster, smaller bundle, better structured output for cloud log aggregators
- **AI pipeline in a separate package**: keeps the retrieval logic testable without spinning up Next.js; makes it easy to move to a worker/queue later
