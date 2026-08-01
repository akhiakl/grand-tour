---
name: grand-tour-testing
description: Testing conventions and ready-made mocking recipes for this repo — vitest setup, fixtures, Redis/Groq/rate-limit/route/component test patterns, coverage rules, and real-browser verification. Use this whenever you write or modify tests, mock a dependency, add a lib function or API route (they always ship with tests), fix a failing test, or need to verify UI changes actually render.
---

# Grand Tour testing

Tests are written WITH the code, never after. A lib function or API
route without a colocated test is an incomplete change. Coverage is
measured over `src/lib/**` + `src/app/api/**` with enforced thresholds
(90% lines/functions, 85% branches) — UI components are covered by
Playwright e2e in the final build step, so don't chase unit coverage on
them; test their behavior where it's cheap (interactions, a11y roles).

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

**External HTTP (Groq)** — stub `fetch` + env, assert the outgoing
payload as well as the result:

```ts
vi.stubGlobal("fetch", fetchMock);
vi.stubEnv("GROQ_API_KEY", "test-key");
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

## Gates

`pnpm test` must be green and `pnpm test:coverage` above thresholds
before any commit; CI blocks below 85% overall. If coverage drops, the
fix is a missing test, never a threshold edit.
