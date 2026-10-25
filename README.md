# Grand Tour

[![CI](https://github.com/akhiakl/grand-tour/actions/workflows/ci.yml/badge.svg)](https://github.com/akhiakl/grand-tour/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=akhiakl_grand-tour&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=akhiakl_grand-tour)
[![Better Stack Badge](https://incidents.betterstack.com/status-badges/v1/monitor/31vg1.svg)](https://incidents.betterstack.com/?utm_source=status_badge)

Craft a beautiful, interactive travel route map — drawn by AI or by hand —
and share it with a single link. Guest-first: no accounts, no user database.

## What's in it

- **Landing (`/`)**: the sample route on a live map; continue your latest
  map, start with AI or by hand, or search a destination first.
- **AI planner (`/plan`)** and **manual editor (`/new`)**, up to 5 stops
  as a guest; maps save in your browser (**My Maps**, `/maps`).
- **Share links (`/t/{id}`)**: immutable snapshots, live 60 days after
  the last view, with remix, poster export and a report link.
- **About, Privacy, Terms, Contact** pages; cookieless analytics.

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui ·
Framer Motion · react-leaflet · next-themes · Upstash Redis · Zod · MapLibre + OpenFreeMap · any OpenAI-compatible LLM

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in AI endpoint + Upstash credentials
pnpm dev
```

## Scripts

| Script               | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `pnpm dev`           | Dev server (Turbopack)                       |
| `pnpm build`         | Production build                             |
| `pnpm lint`          | ESLint (incl. 300-line max rule)             |
| `pnpm typecheck`     | TypeScript, no emit                          |
| `pnpm test`          | Vitest unit tests                            |
| `pnpm test:coverage` | Unit tests + coverage (thresholds enforced)  |
| `pnpm test:e2e`      | Playwright journeys (run `pnpm build` first) |
| `pnpm format`        | Prettier write                               |

Pre-commit hooks (husky + lint-staged) run lint, related tests and
typecheck; commit messages must follow
[Conventional Commits](https://www.conventionalcommits.org) (commitlint).

## Project docs

- [CLAUDE.md](./CLAUDE.md) — AI assistant instructions (architecture,
  design system, hard rules)
- [docs/ROADMAP.md](./docs/ROADMAP.md) — Phase 1 build order: status,
  per-step deliverables and definition of done
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — folder structure,
  module boundaries, testing and tooling standards
- [docs/BRANCHING.md](./docs/BRANCHING.md) — branching strategy
- [docs/RELEASE.md](./docs/RELEASE.md) — versioning, deploy policy and
  the MVP launch checklist
- `.claude/skills/` — project skills (grand-tour, grand-tour-engineering,
  grand-tour-testing, grand-tour-review, nextjs, tailwind, shadcn); they
  apply automatically, see CLAUDE.md → Workflow skills

## Environment variables

| Variable                    | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `AI_BASE_URL`               | OpenAI-compatible endpoint (server only)  |
| `AI_MODEL`                  | Model id for trip generation              |
| `AI_API_KEY`                | Endpoint key, optional (server only)      |
| `UPSTASH_REDIS_REST_URL`    | Shared trip snapshots                     |
| `UPSTASH_REDIS_REST_TOKEN`  | Shared trip snapshots                     |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Self-hosted map style (optional)          |
| `RATES_API_URL`             | Exchange-rate source (optional)           |
| `NEXT_PUBLIC_SENTRY_DSN`    | Sentry monitoring (optional; no-op unset) |
