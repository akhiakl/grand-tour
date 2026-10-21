---
name: grand-tour
description: The product skill for the Grand Tour travel-route-map app — data model, guest limits, API contracts, current module map, field-atlas design recipes, and where every feature lives. Use this whenever you build or modify ANY feature in this repo (pages, components, API routes, schema, design, poster/share work), and read it FIRST when starting a roadmap step.
---

# Grand Tour project skill

## What this app is

Shareable AI travel route maps. Guest-first: no accounts. A trip = ordered
cities + connecting legs, rendered as a full-bleed Leaflet map with one
floating atlas card (title, actions, 2×2 stats, vertical itinerary, city
detail; top-left from `lg`, a draggable bottom card below). Share = immutable
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
5. Secrets (`AI_API_KEY`, Upstash) never reach client bundles.
6. No monitoring calls in components — Sentry is wired via
   instrumentation hooks and gated on `NEXT_PUBLIC_SENTRY_DSN`.

## Module map (where things are TODAY)

- `lib/trip`: `schema` (Zod model), `geo` (bounds/haversine/arcs/route
  path), `stats` (nights/countries/km/budget), `poster-layout`
  (equirect + Web-Mercator projectors, tile math), `sample` (demo trip
  JSON, schema-validated), `service` (server-only Redis: saveTrip/
  getTrip/incrViews, 60-day GETEX TTL), `draft` (editor transforms;
  `draftIssues` returns message keys), `history` (undo/redo, coalesced
  per field), `leg-estimate` (mode + duration from distance), `dates`
  (optional `startDate` → per-stop days), `ics` (calendar export),
  `packing` (trip-shaped packing items as keys; `plug-types`),
  `tools-store` (viewer's packing/notes per trip in localStorage),
  `local-store` (+ last-share tracking, duplicate, import),
  `fingerprint` (stale-share detection), `trip-file` (JSON backups).
- `lib/ai`: `schema` (GenerateRequest, AiTrip + suggestedExtra),
  `prompt`, `generate` (server-only OpenAI-compatible call, one validation-feedback retry),
  `handoff` (chat → editor localStorage), `ghosts` (approximate positions
  for `suggestedExtra`).
- `lib/geo-search`: Photon city search behind `searchCities`.
- `lib/units`: display units. Trips store km and USD budgets;
  `formatDistance` (km/mi), `formatMoney` (USD → viewer currency via
  `Rates`, "~" + rounded when converted, USD fallback), `defaultPrefs`
  (browser locale), `SUPPORTED_CURRENCIES` (ECB set). `/api/rates` serves
  live USD rates (Frankfurter, `RATES_API_URL` override, cached a day);
  `components/units` holds `UnitsProvider`/`useUnits` (prefs in
  localStorage `prefs:display`, rates fetched only for non-USD) and the
  `UnitsDialog` picker in the atlas card head.
- `components/landing`: `landing-cta` (passed to `TripExperience` via its
  `cta` slot as the example route's primary actions): `welcome-back`
  ("Continue <latest map>" takes the brass slot when this browser has
  saved maps), Plan with AI / Build manually, then a destination search
  (`editor/city-search`) whose pick swaps in `destination-start`: AI via
  `planHref` (`/plan?destination=`, read by `destinationFromParam` in
  `lib/ai`) or the editor via `startCityQuery` (`/new?city=…&lat=&lng=`,
  read by `startCityFromParams` in `lib/trip`).
- `lib/legal`: operator and contact facts (`CONTACT_EMAIL`,
  `OPERATOR_NAME`, grievance timelines, `LEGAL_LAST_UPDATED`) and
  `reportMapMailto`. `components/legal`: `LegalPage` shell (summary,
  contents, sections, footer) behind `/privacy`, `/terms`, `/contact`;
  `LegalLinks` (atlas card + footers), `ReportMapLink` (shared view),
  `AiNotice` (chat) and `TermsNotice` (chat pace step, share dialog).
  Open `TODO(legal)` items gate v1.0.0 (see `docs/RELEASE.md`).
- `lib/analytics`: cookieless Vercel Web Analytics behind `trackEvent`
  (`ai_route_generated`, `share_created`, `upsell_shown`) and
  `withoutQuery` (strips query strings before sending);
  `components/site-analytics` mounts it in the root layout.
- `components/about` + `/about`: the scrolling story page (hero with
  `trip/route-sketch`, `how-it-works`, example route, `about-faq` with
  native `<details>`, closing CTA, `legal/site-footer`). No live map on
  it, so nothing traps scrolling. `lib/trip/sketch` (`sketchRoute`) is
  the pure projection behind `RouteSketch` (server-rendered SVG).
- `components/off-the-map`: shared in-voice dead end (global 404,
  expired share, map missing on this device).
- `components/ai`: `ai-chat` (`/plan`, 3 questions → one `/api/generate`
  via `hooks/use-generate-trip` → `/new?from=ai`), `chat-steps`,
  `chat-bubble`. Ghost stops render via `trip/ghost-markers` and open the
  UpsellModal.
- `lib/http`: per-IP sliding-window rate limiters (trips 10/h,
  generate 5/h) + `getClientIp`; `security-headers` (CSP etc., used by
  `next.config.ts`).
- `components/trip`: `trip-experience` (orchestrator: panel + map grid),
  `trip-panel` (views: route / city / packing / notes; ESC steps back) in
  `panel-shell` (the floating `.atlas-card`: top-left from `lg`, draggable
  bottom card below; reports the inset it covers), `panel-head` (eyebrow per variant, title, theme),
  `panel-actions` (`ExperienceVariant`, primary + labeled secondary
  tools), `route-overview` (2×2 stats, vertical itinerary), `city-detail`
  - `drawer-sections` (5 tabs incl. budget calculator), `trip-tools`
    (packing, notes). Map: `trip-map` → `map-canvas`
    (`vector-basemap` + `basemap-tweaks` label muting, markers, flyTo,
    `map-focus` fit/fly + focus-pan clear of the card, `fit-padding` insets + `clearPanOffset`) + `route-layer` (staged curved draw), `map-controls`
    (zoom, fit route), `map-legend`, `map-declutter` + `declutter` (label
    flip/hide, badge hide), `map-overlay`. Also `intro-splash`,
    `poster-dialog` + `draw-poster` + `poster-tiles`, `mode`.
- `i18n`: next-intl, single English locale; ALL copy in
  `i18n/messages/en.json` (typed keys). Components use
  `useTranslations`; tests get real copy via mocks in `vitest.setup.ts`.
- Offline: `public/sw.js` + `components/service-worker` (prod only);
  `/offline` fallback page. Print: `trip/print-itinerary` (print-only).
- `components/ui`: button, sheet, tabs, dialog, checkbox, badge,
  separator — vendored shadcn shape.

## API surface (Phase 1)

- `POST /api/trips` — ratelimit → 50KB cap (413) → city-limit 403
  contract → Zod (400 with issue paths) → `saveTrip` → 201 `{ id }`.
- `POST /api/generate` — ratelimit → Zod request → model JSON mode →
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
- Map: OpenFreeMap positron vector style (`map-style.ts`; `NEXT_PUBLIC_MAP_STYLE_URL` swaps in a self-hosted style) rendered by
  MapLibre inside Leaflet's tile pane (`vector-basemap`), themed by `--map-filter`;
  dashed brass route with marching-ants drift; pulse+dot+label-pill
  markers; zoom 5–12, `maxBoundsViscosity: 1.0`; Leaflet only via
  `next/dynamic` `ssr: false` inside an `isolate` frame (its z-indexes
  leak otherwise).
- Poster: 1080×1350, basemap (offscreen MapLibre via `mercatorCamera`) +
  route share one Mercator view; OpenFreeMap/OSM attribution is drawn
  into the image whenever the basemap renders.

## Before committing

`pnpm lint && pnpm typecheck && pnpm test` green (coverage ≥85%);
keyboard access (ESC, focus trap) for overlays; loading/error/empty
states in-voice; both themes checked; reduced motion respected;
UI changes verified in a real browser (see `grand-tour-testing`).
Conventional Commits; releases per `docs/RELEASE.md`.
