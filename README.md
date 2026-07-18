# Grand Tour

Craft a beautiful, interactive travel route map — drawn by AI or by hand —
and share it with a single link. Guest-first: no accounts, no user database.

## Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui ·
Framer Motion · react-leaflet · next-themes · Upstash Redis · Zod · Groq

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in Groq + Upstash credentials
pnpm dev
```

## Scripts

| Script           | Purpose                          |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Dev server (Turbopack)           |
| `pnpm build`     | Production build                 |
| `pnpm lint`      | ESLint (incl. 300-line max rule) |
| `pnpm typecheck` | TypeScript, no emit              |
| `pnpm test`      | Vitest unit tests                |
| `pnpm format`    | Prettier write                   |

Pre-commit hooks (husky + lint-staged) run lint, related tests and
typecheck; commit messages must follow
[Conventional Commits](https://www.conventionalcommits.org) (commitlint).

## Project docs

- [CLAUDE.md](./CLAUDE.md) — AI assistant instructions (architecture,
  design system, hard rules)
- [docs/BRANCHING.md](./docs/BRANCHING.md) — branching strategy
- `.claude/skills/` — project skills (grand-tour, nextjs, tailwind, shadcn)

## Environment variables

| Variable                   | Purpose                          |
| -------------------------- | -------------------------------- |
| `GROQ_API_KEY`             | AI trip generation (server only) |
| `UPSTASH_REDIS_REST_URL`   | Shared trip snapshots            |
| `UPSTASH_REDIS_REST_TOKEN` | Shared trip snapshots            |
