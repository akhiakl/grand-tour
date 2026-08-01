---
name: grand-tour
description: The product skill for the Grand Tour travel-route-map app — data model, guest limits, API contracts, current module map, field-atlas design recipes, and where every feature lives. Use this whenever you build or modify ANY feature in this repo (pages, components, API routes, schema, design, poster/share work), and read it FIRST when starting a roadmap step.
---

# Grand Tour project skill

## What this app is

Shareable AI travel route maps. Guest-first: no accounts. A trip = ordered
cities + connecting legs, rendered as a full-bleed Leaflet experience with
city drawers, a floating timeline rail and stats cards. Share = immutable
Redis snapshot at `/t/{id}` (60-day sliding TTL); creator's editable copies
live in localStorage; a canvas-drawn Instagram poster shares the route as
an image. `docs/ROADMAP.md` says what's built and what's next — check the
status table before starting work. Visual truth: `reference/grand-tour.html`.

## Sibling skills & MCP servers (use them)

- `grand-tour-engineering` — SOLID/YAGNI, where code goes, how to split.
- `grand-tour-testing` — fixtures, mocking recipes, browser verification.
- `nextjs` / `tailwind` / `shadcn` — framework conventions.
- MCP: **context7** for current Next.js/Tailwind/library docs (prefer it
  over memory for API details); **shadcn** MCP for registry search/add;
  **github** MCP for PRs and CI (no `gh` CLI here).

## Non-negotiables (check before writing code)

1. `GUEST_MAX_CITIES = 5` — server-side Zod gate in `POST /api/trips`
   (403 `{ error: 'city_limit', limit: 5 }`), editor counter + upsell
   modal, AI prompt constraint with `suggestedExtra` ghost stops.
2. All external data through Zod (`@/lib/trip` schemas). 50KB payload cap
   (`MAX_TRIP_PAYLOAD_BYTES`).
3. Server code only behind the two server entries (`@/lib/trip/service`,
   `@/lib/ai/generate`); UI receives data via props, never touches
   Redis/fetch directly.
4. Default trip title "Grand Tour" (`DEFAULT_TRIP_TITLE`); custom titles
   max 80 chars.
5. Secrets (`GROQ_API_KEY`, Upstash) never reach client bundles.
6. No monitoring calls in components — Sentry is wired via
   instrumentation hooks and gated on `NEXT_PUBLIC_SENTRY_DSN`.

## Module map (where things are TODAY)

- `lib/trip`: `schema` (Zod model), `geo` (bounds/haversine/arcs/route
  path), `stats` (nights/countries/km/budget), `poster-layout`
  (equirect + Web-Mercator projectors, tile math), `sample` (demo trip
  JSON, schema-validated), `service` (server-only Redis: saveTrip/
  getTrip/incrViews, 60-day GETEX TTL).
- `lib/ai`: `schema` (GenerateRequest, AiTrip + suggestedExtra),
  `prompt`, `generate` (server-only Groq, one validation-feedback retry).
- `lib/http`: per-IP sliding-window rate limiters (trips 10/h,
  generate 5/h) + `getClientIp`.
- `components/trip`: `trip-experience` (orchestrator), `trip-map` →
  `map-canvas` (tiles/markers/flyTo) + `route-layer` (staged curved
  draw), `timeline-rail`, `city-drawer` + `drawer-sections` (5 tabs incl.
  budget calculator), `top-bar` (chips: Packing/Notes/Poster/theme),
  `stats-strip`, `panels`, `intro-splash`, `poster-dialog` +
  `draw-poster` + `poster-tiles` (canvas poster w/ basemap), `mode`.
- `components/ui`: button, sheet, tabs, dialog, checkbox, badge,
  separator — vendored shadcn shape.

## API surface (Phase 1)

- `POST /api/trips` — ratelimit → 50KB cap (413) → city-limit 403
  contract → Zod (400 with issue paths) → `saveTrip` → 201 `{ id }`.
- `POST /api/generate` — ratelimit → Zod request → Groq JSON mode →
  retry once with validation errors → `{ trip, suggestedExtra }` (never
  saved). 503 `generation_unavailable` / 502 `generation_failed`.
- `GET /t/[id]` (roadmap step 5) — `getTrip` + `incrViews`; expired →
  in-voice not-found; `generateMetadata` + `opengraph-image.tsx` required.

## Design recipes (field atlas — follow exactly)

- Surface: `.frost`; label: `.eyebrow`; display type `font-display`
  (Fraunces) with italic accents; brand title mark = second word italic
  azure (`TitleWithAccent`).
- Color: token utilities only — `bg-paper`, `text-ink`, `text-brass`,
  `text-azure`, `border-line`, `text-muted-foreground`… never hex in
  components. Canvas/poster code reads tokens via `getComputedStyle`.
- Motion: `--ease-atlas` `cubic-bezier(.32,.72,.24,1)`; respect
  `useReducedMotion` for anything that moves a distance.
- Buttons: `variant="brass"` for the signature CTA, `default` (ink)
  standard, `outline`/`ghost` secondary.
- Map: Voyager `nolabels` + `only_labels` tiles themed by `--map-filter`;
  dashed brass route with marching-ants drift; pulse+dot+label-pill
  markers; zoom 5–12, `maxBoundsViscosity: 1.0`; Leaflet only via
  `next/dynamic` `ssr: false` inside an `isolate` frame (its z-indexes
  leak otherwise).
- Poster: 1080×1350, tiles + route share one Mercator view; OSM/CARTO
  attribution is drawn into the image whenever tiles render.

## Before committing

`pnpm lint && pnpm typecheck && pnpm test` green (coverage ≥85%);
keyboard access (ESC, focus trap) for overlays; loading/error/empty
states in-voice; both themes checked; reduced motion respected;
UI changes verified in a real browser (see `grand-tour-testing`).
Conventional Commits; releases per `docs/RELEASE.md`.
