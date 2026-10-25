# Phase 1 roadmap — build order for agents

Execution plan for the remaining Phase 1 work. Each step is one PR on a
`<type>/<name>` branch off `main` (see `docs/BRANCHING.md`), reviewed
before the next step starts. The per-step `Branch:` lines below are the
original plan names.

**Before starting any step, read:** `CLAUDE.md` (hard rules),
`docs/ARCHITECTURE.md` (module boundaries, testing conventions),
`docs/BRANCHING.md` (git workflow), and the skills in `.claude/skills/`
(grand-tour, nextjs, tailwind, shadcn). The canonical visual reference is
`reference/grand-tour.html` — port design details from it, never invent a
new aesthetic.

## Ground rules that apply to every step

- All gates green before commit: `pnpm lint`, `pnpm typecheck`,
  `pnpm test`; overall coverage stays above 85% (`pnpm test:coverage`).
- Colocated unit tests written WITH the code; reused mock data in
  `src/test/fixtures/` as `make*` builders — never inline in test files.
- Max 300 lines per source file; split by responsibility.
- Lib domains consumed via `@/lib/trip`, `@/lib/ai`, `@/lib/http`; server
  code only via `@/lib/trip/service` / `@/lib/ai/generate`.
- Tokens only (`bg-paper`, `text-brass`, `.frost`, `.eyebrow`, …) — never
  hardcoded colors. Both themes + reduced motion checked on UI work.
- Keyboard accessibility: ESC closes overlays, focus trapped in modals.
- Conventional Commits; no AI/assistant references in git history.
- Verify UI work in a real browser (headless Chromium is available;
  see the screenshot scripts pattern in past sessions) before pushing.

**Deploying:** production only deploys from published `vX.Y.Z` releases,
and `v1.0.0` (the first production deploy) is gated on the MVP checklist
in `docs/RELEASE.md`. Do not wire any host to auto-deploy `main`.

## Status

| Step | Scope                                              | State   |
| ---- | -------------------------------------------------- | ------- |
| 1    | Scaffold, tooling, tokens, schema                  | ✅ done |
| 2    | Redis service, /api/trips, /api/generate, limits   | ✅ done |
| 3    | Map + CityDrawer + TimelineRail (reference design) | ✅ done |
| 3.5  | Monitoring (Sentry), SonarQube, CI checks          | ✅ done |
| 4    | Manual editor + Nominatim + localStorage + My Maps | ✅ done |
| 5    | /t/[id] shared view + OG image + remix             | ✅ done |
| 6    | AI chat UI + ghost-stops upsell                    | ✅ done |
| 7    | Landing page + polish pass                         | ✅ done |
| 8    | Playwright e2e                                     | ✅ done |
| 9    | UX & a11y hardening (design-review follow-ups)     | ✅ done |
| 10   | Legal pages, report link, AI notice, analytics     | ✅ done |
| 11   | `/about` story page, motion limits on the map      | ✅ done |
| 12   | Landing: destination search, returning visitors    | ✅ done |

---

## Step 4 — Manual editor, localStorage store, My Maps

Branch: `feature/editor`

**Deliverables**

1. `src/lib/trip/local-store.ts` (client-safe, part of the trip domain):
   CRUD over localStorage — keys `trips:index` (id[]) and `trips:{id}`
   (Trip JSON). Zod-parse everything read back; drop corrupt entries.
   Local ids via `nanoid(8)`. No auto-deletion. Unit-test with a mocked
   localStorage. Export via the domain barrel (it is isomorphic-safe:
   guard on `typeof window`).
2. `/new` editor page (`src/app/new/page.tsx` + `src/components/editor/*`):
   - Query modes: blank, `?from=ai` (payload read from a localStorage
     handoff key written by the AI flow), `?remix={localId}`.
   - Stops list: add / remove / **drag-to-reorder** (keyboard-operable
     too), inline editing of all City fields, per-leg mode picker
     (`select` with the 5 modes) + label + duration.
   - Custom **trip title** field, defaulting to `DEFAULT_TRIP_TITLE`
     ("Grand Tour").
   - Live map preview: reuse `TripMap` (it already handles any valid
     Trip); preview updates as fields change (debounced).
   - **City search via Photon** (`https://photon.komoot.io/api/`, built
     for search-as-you-type; public Nominatim forbids autocomplete),
     debounced ≥500ms with stale requests aborted. Wrap in
     `src/lib/geo-search/` domain (index.ts public API) so the provider
     can be swapped; unit-test the response mapping with fixtures.
   - Guest limit layer 2: always-visible `n/5 stops` counter; "Add city"
     at 5/5 opens the **UpsellModal** ("Sign up for up to 15 stops,
     permanent links & PDF export" — visible locked features, Phase 2
     teaser only, no real auth).
   - Legs stay consistent: reordering/removing cities rebuilds legs so
     `legs.length === cities.length - 1` always holds.
3. `/maps` My Maps page: list from local store (title, stops, nights,
   updated time), open → `/new?remix=`, share → POST + link, delete with
   `alert-dialog` confirm.
4. Share button (editor + My Maps): POST `/api/trips` → on `201 {id}`
   show share dialog with copyable `/t/{id}` URL; on
   `403 {error:"city_limit"}` open UpsellModal; on 413/429/500 show
   in-voice error toasts (`sonner`).

**Primitives needed** (vendor per `.claude/skills/shadcn` if registry
blocked): `input`, `textarea`, `label`, `select`, `dialog`,
`alert-dialog`, `dropdown-menu`, `sonner`, `card`, `skeleton`.

**Definition of done**: create a 3-city trip manually, reorder stops,
share it (mock Redis locally is fine — the route is tested), see it in
My Maps, remix it, delete it; 5th-city upsell fires; all gates green.

---

## Step 5 — Shared view `/t/[id]`, OG image, remix

Branch: `feature/share-links`

**Deliverables**

1. `src/app/t/[id]/page.tsx` — async Server Component: `getTrip(id)`
   (refreshes TTL) + `incrViews(id)`; render the read-only
   `TripExperience` plus:
   - "Remix this trip" → copies snapshot into viewer's localStorage via
     the local store, then routes to `/new?remix={newLocalId}`.
   - "Create your own" CTA → `/new`.
2. Missing/expired id → `notFound()` with a designed in-voice
   `not-found.tsx` ("This map has expired…") + create CTA.
3. `generateMetadata` (title = trip title via the `%s · Grand Tour`
   template, description from stats) **and** `opengraph-image.tsx` with
   `next/og`: brand tokens, route line drawn from city coordinates
   (scale `routeBounds` into the 1200×630 canvas), city names, title.
   This is the social-share hook — required, not optional.
4. Read-only mode: `TripExperience` gets an optional `actions` variant so
   the shared view shows Remix/Create CTAs (no editor affordances).

**Definition of done**: with real Upstash env, share → open `/t/{id}` in
a fresh profile → drawer/map fully work, OG image renders (check
`/t/{id}/opengraph-image`), expired id shows the designed page, remix
lands in the editor with a copy.

---

## Step 6 — AI chat + ghost-stops upsell

Branch: `feature/ai-chat`

**Deliverables**

1. `src/components/ai/ai-chat.tsx` (+ `/plan` route or modal from
   landing): guided 3-question flow — destination/region, days (2–30),
   vibe (relaxed/balanced/packed) — matching `GenerateRequestSchema`.
   ONE call to `/api/generate` (route already exists), styled as an
   in-voice chat (frost bubbles, brass accents), with `skeleton` loading
   state ("Drafting your route…").
2. Success → write `{trip, suggestedExtra}` to the localStorage handoff
   key → `/new?from=ai` (AI drafts, human edits).
3. `suggestedExtra` → **ghost stops**: grayed, locked markers on the
   editor map (approximate positions are fine — no geocoding of ghosts;
   render as dashed/40%-opacity pills with a lock); tap/click opens
   UpsellModal (layer 3 of the guest limit).
4. Error handling per route contract: 429 → "The atlas needs a breather"
   retry-later state; 502/503 → clear error, editor opens blank.

**Definition of done**: mocked `/api/generate` returns a fixture trip in
tests; with a real `AI_BASE_URL` + `AI_MODEL` the flow lands a 5-city draft in the
editor with ghost stops; upsell opens from a ghost stop.

---

## Step 7 — Landing page + polish pass

Branch: `feature/landing`

**Deliverables**

1. `/` becomes the real landing: hero with the **live demo map**
   (`SAMPLE_TRIP` experience, exactly what exists today) plus two CTAs —
   "Plan with AI" (→ chat) and "Build manually" (→ `/new`) — and a
   "My maps" link. Keep the immersive full-bleed character; CTAs live in
   the floating chrome (e.g. a bottom-right frost cluster or a topbar
   slot), Fraunces display + brass `Button` variant.
2. Polish pass across all pages: loading/empty/error states in-voice,
   responsive audit at 360/768/1280, focus-visible audit, reduced-motion
   audit, no layout shift on theme toggle, Lighthouse a11y ≥ 95.
3. Copy pass: everything speaks "field atlas" voice (see reference).

**Definition of done**: browser-verified screenshots light+dark at 3
breakpoints; every journey reachable from `/`.

---

## Step 8 — Playwright e2e (LAST)

Branch: `feature/e2e`

**Deliverables**

1. Install via CLI: `pnpm create playwright@latest` (or
   `pnpm dlx playwright install` pattern) — tests in `e2e/`
   (max-lines-exempt), config `playwright.config.ts`, script
   `test:e2e`. In this remote environment use the pre-installed
   Chromium (`executablePath: /opt/pw-browsers/chromium`); never run
   `playwright install`.
2. Mock network at the edge: route-intercept `/api/generate` (fixture
   trip) and `/api/trips` (fake id) — no real LLM/Redis in e2e.
   `/t/{id}` reads Redis on the server, so `e2e/fake-upstash.ts` (an
   in-memory Upstash REST stub started by Playwright) serves it; tests
   seed snapshots with `seedSharedTrip`. OpenFreeMap, Photon and
   `/api/rates` are stubbed per test.
3. Four core journeys:
   1. manual create → share → open `/t/{id}` → remix
   2. AI create flow (mocked generate) → editor prefilled
   3. guest 5-city limit → upsell modal (editor + ghost stop)
   4. expired trip page (`getTrip` → null path).
   5. (added) units: switch to miles + another currency, persists.
   6. (added) atlas card: stop detail from itinerary and marker, ESC
      back, packing state, legend, landing CTAs, Customize → My maps;
      mobile sheet rest/open/map-tap and marker tap.
4. Wire `test:e2e` into CI as a separate job (build → start → test
   against `localhost:3000`; cache browsers).

**Definition of done**: `pnpm test:e2e` green locally and in CI.

---

## Step 9 — UX & a11y hardening

Follow-ups from a heuristic design review, triaged against the code
(generic or already-handled points dropped). Three PRs:

1. `fix/editor-state` — editor resolves its draft after mount (no
   hydration mismatch on `/new?remix=`); inline validation via
   `draftIssues` (blank title / city name, nights clamped 0–30) and Share
   focuses the first invalid field; the open detail panel follows its
   stop through reorders and deletes; every detail input is labelled.
2. `feature/editor-a11y` — reorder/delete announced in an `aria-live`
   region, grip-only drag with a drop indicator, Undo toast on delete,
   visible focus on the title input, editor map follows the active stop.
3. `feature/trip-view-a11y` — marker focus ring and keyboard-focused
   markers panned clear of the atlas card, hover sync row ↔ marker,
   `title` on truncated names, fluid card width, desktop collapse.

**Definition of done**: gates + e2e green; browser-verified light/dark at
desktop and mobile; Lighthouse a11y ≥ 95 on `/`, `/new`, `/maps/[id]`.

---

## One-time human tasks (not agent work)

- [ ] Upstash Redis created; `UPSTASH_REDIS_REST_URL` / `_TOKEN` in
      `.env.local` + deploy host env.
- [ ] `AI_BASE_URL` / `AI_MODEL` (+ `AI_API_KEY` if needed) in `.env.local` + deploy host env.
- [ ] Sentry project created; `NEXT_PUBLIC_SENTRY_DSN` set (optional
      `SENTRY_ORG/PROJECT/AUTH_TOKEN` in CI for source maps).
- [x] SonarQube: Automatic Analysis ON (no token); New Code = previous version.
- [ ] Branch protection on `main`: Lint, Typecheck, Unit tests &
      coverage, Build, Conventional title + SonarQube quality gate;
      1 review; linear history (see `docs/BRANCHING.md`).
- [ ] Optional: allowlist `ui.shadcn.com` in the remote environment's
      network policy so `shadcn add` works in cloud sessions.
- [ ] `RELEASE_PLEASE_TOKEN` repo secret (PAT) so CI runs on release PRs.
- [ ] `DEPLOY_HOOK_URL` repo secret once a host is chosen; disable the
      host's auto-deploy of `main` (see `docs/RELEASE.md`).

## Phase 2 parking lot (do NOT build in Phase 1)

Auth (NextAuth), Postgres, premium tier (15 cities, `PERSIST`ed
permanent links, PDF export, custom themes, no watermark), views
dashboard, GraphQL/tRPC transport, editing inside the floating atlas
card (one layout for view and edit, instead of the split editor). The trip service stays plain
functions so a different transport can wrap it later.
