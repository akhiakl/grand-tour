# Grand Tour — AI assistant instructions

Grand Tour is a guest-first service for creating beautiful, interactive travel
route maps — populated by AI chat or manually — shared via short links
(`/t/{id}`). No accounts, no user DB in Phase 1.

## Commands

- `pnpm dev` — dev server (Turbopack)
- `pnpm lint` / `pnpm typecheck` / `pnpm test` — quality gates; all must be
  green before any commit
- `pnpm test:coverage` — coverage with enforced thresholds (lib + api)
- `pnpm build` — production build
- `pnpm format` — Prettier

## Hard rules

- **Do not assume.** If a requirement, API shape, or design detail is
  ambiguous, stop and ask before implementing.
- **Max 300 lines per source file** (ESLint `max-lines`, blank lines and
  comments excluded; test files and `e2e/**` exempt). Split by
  responsibility — never compress formatting to dodge the rule.
- **Install dependencies via CLI at latest** (`pnpm add <pkg>`); never
  hand-write version numbers into package.json.
- **Conventional Commits** (feat/fix/chore/refactor/test/docs) — enforced by
  commitlint on the commit-msg hook.
- **Server-side secrets only**: `AI_API_KEY` and Upstash credentials must
  never reach client bundles.
- Unit tests are written alongside code (colocated `foo.ts` + `foo.test.ts`),
  not deferred. Schema, service layer, and utils always have coverage;
  overall coverage stays above 85% (vitest thresholds fail CI below that).
- **Reused mock data lives in `src/test/fixtures/`** (`make*` builders with
  `Partial<T>` overrides) — never defined inside an individual test file.
  Module mocks (`vi.mock`) stay per-file; the data they return comes from
  fixtures.
- Playwright e2e is the LAST build step only.

## Architecture

- Next.js App Router, TypeScript strict, Tailwind v4, shadcn/ui,
  Framer Motion, react-leaflet (dynamic import, `ssr: false`), next-themes.
- **Domain modules**: `src/lib/<domain>` folders are internal packages with
  an `index.ts` public API (see `docs/ARCHITECTURE.md`). Consume them via
  `@/lib/trip`, `@/lib/ai`, `@/lib/http` — deep imports are lint-rejected
  except the server entry points `@/lib/trip/service` and
  `@/lib/ai/generate`, which carry `import "server-only"`.
- **Service layer**: `src/lib/trip/service.ts` is plain transport-agnostic
  functions over Upstash Redis. Only route handlers / server components may
  call it. UI components receive data and handlers via props — no component
  reaches into Redis or `fetch` directly.
- **Validation**: everything through Zod (`src/lib/trip/schema.ts`).
  `GUEST_MAX_CITIES = 5` is enforced server-side (the real gate), in the
  editor UI (counter + upsell modal), and in the AI prompt
  (`suggestedExtra` ghost stops).
- **Persistence**: creator's editable trips in localStorage
  (`trips:index`, `trips:{id}`); shared snapshots immutable in Redis with
  60-day sliding TTL (GETEX refresh). Editing after sharing = share again.
- Trip payloads are capped at 50KB (`MAX_TRIP_PAYLOAD_BYTES`).
- **Monitoring**: Sentry (`@sentry/nextjs`) via the instrumentation hooks;
  fully gated on `NEXT_PUBLIC_SENTRY_DSN` — never add monitoring calls in
  components; error boundaries and `onRequestError` cover capture.
- Default trip title is "Grand Tour" (`DEFAULT_TRIP_TITLE`); users can set a
  custom title per trip.

## Design system — "field atlas", minimal luxury

Follow exactly; tokens live in `src/app/globals.css`:

- Fonts: Fraunces (display, 400–600, italic accents) + Outfit (UI/body) via
  `next/font/google` → `font-display` / `font-sans` utilities.
- Palette (light / dark): paper `#F5F1E8`/`#0E1420`, ink `#16233A`/`#EDEAE2`,
  ink-soft `#4A5568`/`#9AA5B5`, brass `#B98A2F`/`#D4A94E`,
  azure `#3E7CB1`/`#6FA8D6`, line `rgba(22,35,58,.12)`/`rgba(237,234,226,.12)`.
  Small brass text/icons use `--brass-text` (light `#8A6420`, dark = brass)
  for WCAG AA contrast; brass buttons take ink text. Use the Tailwind
  utilities (`bg-paper`, `text-ink`, `text-brass-text`,
  `border-line`, …) — never hardcode hex values in components.
- Layout: trip views are a full-bleed map with ONE floating atlas card
  (`.atlas-card`: dense frost, radius 22px) holding all trip content —
  top-left from `lg`, a draggable floating bottom card below. The map
  carries only zoom / fit-route controls and a legend; never scatter
  other content cards over it.
- Surfaces: `.frost` (backdrop-blur 18px, 1px `--line` border, radius
  14–20px, soft long shadow) for dialogs; small map overlays use solid
  `bg-card-solid`. Labels: `.eyebrow` (10px, tracking .28em,
  uppercase, brass).
- Motion: Framer Motion with `cubic-bezier(.32,.72,.24,1)` (`--ease-atlas`);
  always respect `prefers-reduced-motion`.
- Map: OpenFreeMap positron vector tiles (MapLibre in Leaflet; open source,
  no API key), desaturated (light) / inverted + hue-rotated
  (dark); animated brass route path (SVG `pathLength`); transport emoji
  badges at leg midpoints; stop labels beside their dot, decluttered
  (flip / fade / hide badges) so nothing overlaps; basemap POI and minor
  labels hidden, the rest faded; bounds fit to cities clear of the sheet,
  `maxBoundsViscosity: 1.0`, zoom 5–12.
- Theme via next-themes (`class` attribute); no layout shift on toggle.
- shadcn/ui components live in `src/components/ui`; add new ones with
  `pnpm dlx shadcn@latest add <component>` and restyle via the token-mapped
  CSS variables, not per-component hex.

## Quality bar

Production TypeScript, fully responsive, keyboard accessible (ESC closes
drawers, focus trap in modals), loading/error/expired states designed
in-voice and actionable, reduced motion respected.

## Phase 2 non-goals (do not build, do not block)

Auth, Postgres, premium tier (15 cities, permanent links, PDF export,
custom themes), views dashboard, GraphQL/tRPC. Keep the trip service plain so
another transport can wrap it later.

## Build order

`docs/ROADMAP.md` is the authoritative step-by-step plan (deliverables,
contracts, definition of done per step). One step = one `feature/*` PR,
reviewed before the next starts. Releases are semver via release-please;
production deploys only from published releases, and `v1.0.0` is gated on
the MVP checklist in `docs/RELEASE.md` — never wire deploys to `main`.

## Git

See `docs/BRANCHING.md` for branching and `docs/ARCHITECTURE.md` for the
folder structure, module boundaries and portability rules. Work happens on `feature/*` branches off `main`;
Conventional Commits only.
