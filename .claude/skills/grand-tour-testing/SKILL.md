---
name: grand-tour-testing
description: Test-first workflow, testing conventions and mocking recipes for this repo — which layer proves a behavior, vitest setup, fixtures, Redis/AI-model/rate-limit/route/component patterns, coverage rules, Playwright e2e, and light/dark screenshot verification of changed screens. Use this whenever you start a feature, bug fix or behavior change (before writing implementation code), write or modify tests, mock a dependency, add a lib function or API route, fix a failing test, or add or visibly change a screen.
---

# Grand Tour testing

Tests are written WITH the code, never after. A lib function or API
route without a colocated test is an incomplete change. Coverage is
measured over `src/lib/**` + `src/app/api/**` with enforced thresholds
(90% lines/functions, 85% branches) — UI components are covered by
Playwright e2e in the final build step, so don't chase unit coverage on
them; test their behavior where it's cheap (interactions, a11y roles).

## Test-first workflow (every feature, fix or behavior change)

Red, green, refactor at the lowest layer that can prove the behavior.

| Behavior lives in                      | Prove it with                | Where                            |
| -------------------------------------- | ---------------------------- | -------------------------------- |
| Pure logic, schema, Redis service      | Vitest                       | `src/lib/**/foo.test.ts`         |
| API route contract (status + body)     | Vitest, route handler called | `src/app/api/**/route.test.ts`   |
| Component behavior (roles, text, keys) | Vitest + Testing Library     | `src/components/**/foo.test.tsx` |
| User journey across pages              | Playwright                   | `e2e/*.spec.ts`                  |

1. Write the failing test first, named as behavior
   (`it("keeps a removed stop's undo for one toast")`).
2. Run it; confirm it fails for the right reason.
3. Write the least code that passes, then refactor with tests green.
4. A user-visible flow gets one Playwright journey; locate by role and
   visible text, never test ids unless text is ambiguous.
5. A new or visibly changed screen: screenshots (below) before handing off.
6. Never skip, disable or weaken a test to get green. No whole-page
   snapshot tests. Mock at boundaries only (Redis, `fetch`, AI model),
   never the unit under test.

## Conventions

- Colocated `foo.ts` + `foo.test.ts`. Explicit imports from `vitest`
  (no globals). Testing Library cleanup is wired in `vitest.setup.ts`.
- **Reused mock data lives in `src/test/fixtures/`** as `make*` builders
  taking `Partial<T>` overrides (`makeTrip`, `makeCity`, `makeLeg`,
  `makeGenerateRequest`, `makeAiTrip`). Never define shared data inside
  a test file; extend the builders instead. `vi.mock` module mocks stay
  per-file (vitest hoists them) — the data they return comes from
  fixtures.
- Assert behavior and contracts (status codes, rendered text, returned
  values), not implementation details.

## Recipes (copy these shapes)

**Redis-backed service** — mock the client, not the network:

```ts
const redisMock = vi.hoisted(() => ({ setex: vi.fn(), getex: vi.fn() }));
vi.mock("@upstash/redis", () => ({ Redis: { fromEnv: vi.fn(() => redisMock) } }));
```

**API route** — import the exported `POST`, mock the lib modules it
uses, call it with a plain `Request`:

```ts
vi.mock("@/lib/http", () => ({
  getRatelimiter: () => ({ limit: mocks.limit }),
  getClientIp: () => "203.0.113.9",
}));
vi.mock("@/lib/trip/service", () => ({ saveTrip: mocks.saveTrip }));
// then: await POST(new Request("http://localhost/api/trips", {...}))
```

Cover every branch the route can return (success, 4xx contract shapes,
429, 5xx) — the error contract IS the API.

**External HTTP (AI model)** — stub `fetch` + env, assert the outgoing
payload as well as the result:

```ts
vi.stubGlobal("fetch", fetchMock);
vi.stubEnv("AI_BASE_URL", "http://ai.test/v1");
vi.stubEnv("AI_MODEL", "test-model");
// afterEach: vi.unstubAllGlobals(); vi.unstubAllEnvs();
```

**Components** — `render` + `screen` + `userEvent`; query by role/text.
Radix overlays (Sheet/Dialog/Tabs) work in jsdom: tabs switch via
`getByRole("tab")`, ESC via `userEvent.keyboard("{Escape}")`. Partial
module mocks keep real exports:
`vi.mock("@/lib/ai/generate", async (orig) => ({ ...(await orig()), generateTrip: mocks.generateTrip }))`.

**Leaflet/map components** — don't unit-test them (jsdom can't measure
layout); pure geometry belongs in `lib/trip` where it's trivially
tested, and the canvas/map gets browser verification instead.

## Real-browser verification (before pushing UI work)

Unit tests can't see rendering bugs (zero-height containers, z-index
leaks, theme misses). Verify visually:

```bash
pnpm build && pnpm start &   # production server on :3000
```

Then a `playwright-core` script (Chromium is preinstalled — never run
`playwright install`):

```js
import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on("pageerror", (e) => console.log("[pageerror]", e));
await page.goto("http://localhost:3000");
// interact via roles, screenshot both themes, read the images yourself
```

Two sandbox realities: external tile/CDN hosts may be blocked — use
`page.route()` to fulfill those requests with generated stand-in
responses when the feature depends on them; and always screenshot light
AND dark (toggle via the theme chip) since tokens flip per theme.

**Screenshots of every new or visibly changed screen** (the user verifies
UI from them):

- Capture light AND dark, at mobile (390 wide) and desktop (1280+) widths.
- Cover each state as its own shot: empty, loading, error, expired and
  edited, not just the happy path. Seed shared maps with the fake Upstash
  (`e2e/fake-upstash.ts`) and mock browser calls with `page.route`.
- Save to the scratchpad, never the repo. Look at every image yourself
  first and fix overlap, clipping, contrast or empty-state problems; then
  send them to the user with a one-line caption each.

## Gates

`pnpm test` must be green and `pnpm test:coverage` above thresholds
before any commit; CI blocks below 85% overall. If coverage drops, the
fix is a missing test, never a threshold edit.

## Playwright e2e

- `pnpm build && pnpm test:e2e` — runs against `next start` on :3000.
  In this remote environment pass
  `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium` (never run
  `playwright install`); CI installs and caches Chromium itself.
- `e2e/fixtures.ts` exports `test` (OpenFreeMap style stubbed for every
  page), `expect` and `seedSharedTrip(id, trip)`. Server-side Redis is the
  in-memory `e2e/fake-upstash.ts`; browser-side calls (`/api/generate`,
  `/api/trips`, `/api/rates`, Photon) are `page.route` mocks fed from
  `src/test/fixtures/`.
- Locale matters: Desktop Chrome defaults to en-US (miles, USD). Pin
  `test.use({ locale })` when a journey depends on units.
- Leaflet markers are 0×0 anchors; click `.marker-dot` (or the label),
  never the `.marker` wrapper.
