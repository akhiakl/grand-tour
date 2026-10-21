# Architecture & repository conventions

This repo doubles as a template: the structure, boundaries and tooling here
are the standard for any Next.js project we start.

## Routes (named — never "home page")

| Route                            | Name            | What it is                                                                                                                                                                                                                                        |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                              | **Landing**     | The sample trip in the immersive view (`actions="demo"`), with the landing card as its main actions: "Continue <latest map>" for returning visitors, Plan with AI / Build manually, and a destination search that hands off to `/plan` or `/new`. |
| `/about`                         | **About**       | Static story page: how it works, the example route as a sketch, FAQ, CTA. No live map.                                                                                                                                                            |
| `/plan`                          | **AI Chat**     | Three-question planner (`?destination=` pre-answers the first question).                                                                                                                                                                          |
| `/new`                           | **Editor**      | Manual trip builder (`?remix=`, `?from=ai`, `?city=…&lat=&lng=` for a first stop).                                                                                                                                                                |
| `/maps`                          | **My Maps**     | Index of this device's local trips.                                                                                                                                                                                                               |
| `/maps/[id]`                     | **Map View**    | Immersive view of one of _your_ local trips, no share link needed. `TripExperience actions="own"`: Edit (in place) + Share.                                                                                                                       |
| `/t/[id]`                        | **Shared View** | Public, read-only view of a shared Redis snapshot. `TripExperience actions="shared"`: Remix (forks a copy) + Create your own + Report this map.                                                                                                   |
| `/privacy`, `/terms`, `/contact` | **Legal**       | Policy and contact pages on the shared `LegalPage` shell; facts come from `@/lib/legal`.                                                                                                                                                          |
| `/offline`                       | **Offline**     | Served by the service worker (`public/sw.js`) for pages never opened before the connection dropped.                                                                                                                                               |

`TripExperience` (full-bleed map + floating atlas card) is hosted by three of these routes,
distinguished only by its `actions` prop (`"demo" | "shared" | "own"`, see
`components/trip/panel-actions.tsx`'s `ExperienceVariant`) — the map,
itinerary, city detail and tools are identical everywhere.

## Folder structure

```
src/
  app/                  Next.js routes only — thin HTTP/rendering shells.
    api/<name>/route.ts   Parse request → call lib → shape response. No logic.
  components/
    ui/                 shadcn primitives — dumb, style-token-driven, no app logic.
    …                   Feature components — data and handlers via props only.
  hooks/                Shared client hooks.
  i18n/                 next-intl config: `request.ts` (server config, single
                        locale), `config.ts` (locales), `messages/en.json`
                        (EVERY UI string), `app-config.d.ts` (typed keys).
  lib/                  Framework-agnostic core. One folder per domain,
                        structured as an "internal package":
    trip/
      index.ts          PUBLIC API — isomorphic model (schemas, types, constants).
      schema.ts         Zod model. Depends on zod only.
      service.ts        SERVER entry point (`import "server-only"`) — Redis persistence.
    ai/
      index.ts          PUBLIC API — isomorphic request/output schemas.
      generate.ts       SERVER entry point — OpenAI-compatible model call + validation retry.
      prompt.ts         Internal module (not exported; tests reach it relatively).
    http/
      index.ts          PUBLIC API — rate limiting, client IP (server concerns).
    units/              Display units: km/mi, currency formatting, live rates.
    geo-search/         City search (Photon) behind `searchCities`.
    legal/              Operator and contact facts, report-a-map link.
    analytics/          Cookieless Vercel Web Analytics behind `trackEvent`.
    utils.ts            cn() — kept at this path for shadcn compatibility.
  test/
    fixtures/           ALL reused mock data/builders. Never define shared
                        fixtures inside an individual test file.
    stubs/              Test stand-ins for environment markers (server-only).
```

## Module boundaries (ESLint-enforced)

- Domains are consumed through their `index.ts` public API
  (`@/lib/trip`, `@/lib/ai`, `@/lib/http`, `@/lib/units`, …). Deep imports are rejected by
  `no-restricted-imports`, except the documented server entry points
  `@/lib/trip/service` and `@/lib/ai/generate`.
- Public APIs stay isomorphic; anything touching secrets/IO carries
  `import "server-only"` so the bundler fails the build if it ever leaks
  toward the client.
- `src/app` and `src/components` never import Redis/AI-model modules directly
  from client components — server components and route handlers are the
  only callers of server entry points.
- Colocated tests may import their subject relatively (`./prompt`) — the
  boundary rule targets the `@/…` alias, i.e. cross-module consumers.

## Portability ("packages later, not now")

Each `src/lib/<domain>` folder is written so it can be lifted into
`packages/<domain>` in a pnpm workspace without code changes beyond the
import alias:

- plain exported functions, no framework imports (Next/React) inside `lib`
- explicit public API via `index.ts`; internals are private by convention
  and by lint rule
- dependencies point "inward" only: `ai` → `trip`, never the reverse;
  `http` depends on neither
- unit tests live beside the code and travel with the folder

Do NOT create the workspace until a second consumer actually exists.

## Testing conventions

- Colocated `foo.ts` + `foo.test.ts`, written together — never deferred.
- Reused mock data lives in `src/test/fixtures/*` as `make*` builders with
  `Partial<T>` overrides. Module mocks (`vi.mock`) stay per-file — vitest
  hoists them — but the data they return comes from fixtures.
- Schema, service layer and utils always have coverage; route handlers are
  tested through their exported `POST`/`GET` with lib modules mocked.
- Playwright e2e lands last, in `e2e/` (exempt from max-lines). It also
  guards accessibility and layout: `a11y.spec.ts` runs axe (WCAG 2.1 AA)
  on every page in both themes, `responsive.spec.ts` fails any page that
  scrolls sideways at 360 / 768 / 1280, and `motion-theme.spec.ts` checks
  reduced motion and that a theme switch moves nothing.

## Tooling standard

- ESLint: `jsx-a11y` recommended rules as errors, `max-lines` 300
  (tests/e2e exempt), `import/order`,
  `consistent-type-imports`, `eqeqeq`, `no-console` (warn/error allowed),
  domain-boundary `no-restricted-imports`, Prettier last.
- Husky pre-commit: lint-staged (eslint --fix, related vitest, prettier) +
  full typecheck. commit-msg: commitlint (Conventional Commits).
- CI (`.github/workflows/ci.yml`): lint, typecheck, test, build and e2e on
  every PR and push to main. Shared steps come from `akhiakl/ci-workflows`
  (private; it must allow access from akhiakl repos), pinned to a commit
  SHA marked `# v1`: `setup-pnpm`, `playwright-browsers`, the run-check
  action around each check, and a sticky **Quality Gate** PR comment that
  lists what failed. PR title, release-please and deploy call its reusable
  workflows. Bump all pins together when `ci-workflows` changes.
- Node pinned via `.nvmrc` + `engines`; pnpm via `packageManager`.
- Coverage: `pnpm test:coverage` (v8) over `src/lib/**` + `src/app/api/**`
  with enforced thresholds; UI components are covered by e2e instead.
  PRs get a coverage comment via `vitest-coverage-report-action`.
- Static analysis: SonarQube Cloud Automatic Analysis ("Sonar way" gate)
  via its GitHub App; scope in `.sonarcloud.properties`. Coverage is
  gated by vitest only.

## Copy and i18n

All UI copy lives in `src/i18n/messages/en.json` and is read with
next-intl (`useTranslations` in client/server components,
`getTranslations` in server components and metadata, `createTranslator`
where no request context exists: `global-error.tsx`, OG images). Keys are
type-checked against the English catalog. There is no locale routing yet:
`request.ts` serves the one locale. `lib` code never returns UI text; it
returns message keys (`DraftIssueKey`, `PackingKey`) for components to
translate, and formats dates in the locale it is given. Tests resolve copy
from the real catalog through the `next-intl` mocks in `vitest.setup.ts`.

One exception: the Privacy and Terms policy text (summary and sections in
`src/app/privacy/page.tsx` and `src/app/terms/page.tsx`) stays inline as a
versioned legal document. Their page chrome and metadata use the catalog.

## Offline

`public/sw.js` (registered in production by `components/service-worker`)
keeps opened maps readable offline: pages network-first with a cached
fallback, hashed assets cache-first, basemap tiles stale-while-revalidate
(capped at 1,500). API calls are never cached except `/api/rates`. Bump
`VERSION` in the worker when its caching rules change.

## Security headers

`next.config.ts` sends a static CSP plus Referrer-Policy, nosniff,
frame denial, Permissions-Policy and HSTS, built by
`src/lib/http/security-headers.ts`. `connect-src` allowlists only the map
style origin, Photon and the Sentry DSN host; add any new third-party
host there. No nonces, so pages stay static (inline scripts allowed).

## Observability

- Sentry via `@sentry/nextjs`, wired in `instrumentation.ts`
  (server/edge + `onRequestError`), `instrumentation-client.ts`
  (uncaught browser errors and rejections) and `src/app/global-error.tsx`
  (last-resort boundary, in-voice copy, inline styles only — it replaces
  the root layout so globals.css is unavailable).
- In the browser, Sentry goes through `@/lib/monitoring`
  (`captureError`, `watchGlobalErrors`), which downloads the SDK only when
  an error is reported. It is never in the startup bundle, so there is no
  client performance tracing; page speed comes from Vercel Analytics.
- Everything is gated on `NEXT_PUBLIC_SENTRY_DSN`: unset → total no-op.
  Source-map upload happens only when `SENTRY_AUTH_TOKEN` exists (CI).
- Keep server sample rates conservative (`tracesSampleRate: 0.1`) to stay
  inside the free tier; raise deliberately, never by default.

## Performance budget

Lighthouse mobile simulates a slow phone, so script that runs before first
paint counts against every metric. Keep it out of the startup bundle:

- The map engine (MapLibre + Leaflet), dialogs and the print itinerary
  mount once the page is idle (`usePageIdle`).
- Framer Motion features load lazily (`MotionProvider` + `m.*`;
  `motion.*` is lint-rejected).
- Import Zod as `import * as z from "zod"`; the named `z` drags every
  locale into the client (lint-rejected).
