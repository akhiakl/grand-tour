---
name: grand-tour-engineering
description: How code is designed, placed and split in this repo — SOLID applied pragmatically, YAGNI enforced, module boundaries, file-splitting strategy. Use this whenever you write, move or refactor ANY source file in Grand Tour — new features, new utilities, new components, API routes, or when a file nears the 300-line limit and needs splitting, or when deciding WHERE new code should live.
---

# Grand Tour engineering principles

The goal: code that reads clearly today and lifts into packages tomorrow,
with zero speculative machinery. Two forces in tension — SOLID pulls
toward separation, YAGNI pulls against building what nothing needs yet.
When they conflict, YAGNI wins until the roadmap step in front of you
needs the abstraction.

## Where code goes (decide BEFORE writing)

| Kind of code              | Home                                                               | Example in repo                                         |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| Domain model / validation | `src/lib/<domain>/schema.ts`                                       | `trip/schema.ts` (Zod)                                  |
| Pure computation          | `src/lib/<domain>/*.ts`                                            | `trip/geo.ts`, `trip/stats.ts`, `trip/poster-layout.ts` |
| IO / secrets (server)     | domain server entry with `import "server-only"`                    | `trip/service.ts`, `ai/generate.ts`                     |
| HTTP edges                | `src/app/api/*/route.ts` — thin: parse → call lib → shape response | `api/trips/route.ts`                                    |
| Feature UI                | `src/components/<feature>/`                                        | `components/trip/*`                                     |
| Dumb primitives           | `src/components/ui/` (shadcn shape, no app logic)                  | `button.tsx`, `sheet.tsx`                               |
| Shared client hooks       | `src/hooks/`                                                       | —                                                       |
| Test data builders        | `src/test/fixtures/`                                               | `fixtures/trip.ts`                                      |

If a piece of logic could run in Node with no DOM and no framework, it
belongs in `src/lib` — that is what makes it testable and portable. The
poster is the model case: projection math lives in
`lib/trip/poster-layout.ts` (pure, unit-tested), canvas drawing lives in
`components/trip/draw-poster.ts` (DOM), and the dialog only orchestrates.

## SOLID, as practiced here

- **Single responsibility** — one file, one reason to change. The
  300-line ESLint ceiling is the forcing function: when a file
  approaches it, split by responsibility (`map-canvas` / `route-layer` /
  `poster-tiles`), never by squeezing formatting. A component that
  fetches, computes and renders is three files waiting to happen.
- **Open/closed** — extend through variants and composition, not
  branches inside callers. New button look → new `cva` variant in
  `button.tsx`; new drawer tab → new section component plugged into the
  `TABS` list. If you're threading a boolean prop through three layers
  to change one branch, add a variant instead.
- **Liskov** — vendored `ui/` primitives keep the upstream shadcn
  contract (`asChild`, `data-slot`, ESC/focus behavior) so any of them
  can be regenerated from the registry without breaking callers.
- **Interface segregation** — components receive the narrowest props
  that do the job (`CityDrawer` takes a `City`, not the whole app
  state). Domain barrels (`lib/<domain>/index.ts`) are deliberate,
  narrow public APIs — exporting something is a commitment.
- **Dependency inversion** — UI depends on data and callbacks via
  props; only route handlers and server components touch
  `@/lib/trip/service` / `@/lib/ai/generate`. The service layer stays
  plain functions precisely so another transport can wrap it later
  without a rewrite.

Dependency direction is one-way and lint-enforced: `components` → domain
barrels → (nothing back). Across domains, `ai` may import `trip`; never
the reverse; `http` imports neither. Deep imports are rejected except
the two documented server entries.

## YAGNI, concretely

- Build for the current roadmap step (`docs/ROADMAP.md`), not for a
  future one. Phase 2 items (auth, Postgres, premium, tRPC) are a
  parking lot — don't scaffold toward them, don't block them either.
- No pnpm workspace / `packages/*` until a second consumer actually
  exists — the lib layout already makes extraction cheap.
- No props, options, generics or config that today has exactly one
  value. Two concrete call sites may earn an abstraction; one never
  does. (The checklist logic existing in two places is a real signal;
  a "maybe someday" second theme is not.)
- Don't add dependencies for what ~20 lines of tested code does —
  the Groq client is plain `fetch`; the poster is plain canvas.
- When tempted to generalize mid-task, ship the concrete version and
  note the idea in the PR description instead.

## Splitting a file that's outgrowing 300 lines

1. Name the responsibilities it currently holds (usually 2–3).
2. Move pure logic down into `lib` first — it gets tests for free.
3. Extract self-contained render chunks into sibling components
   (`drawer-sections.tsx` pattern).
4. Keep the original file as the orchestrator with the same public
   export, so callers don't change.

## New lib domain vs. new file in an existing one

Create a new `src/lib/<domain>` folder (with `index.ts`) only when the
code has its own vocabulary AND its own dependency set AND a plausible
independent consumer — e.g. the planned `geo-search` (Nominatim) domain:
different provider, swappable, nothing to do with trip persistence.
Otherwise add a file to the closest existing domain and export it
through the barrel.

## Checks that enforce all of this

`pnpm lint` (max-lines, import boundaries, readonly props),
`pnpm typecheck`, `pnpm test` — green before every commit. See the
`grand-tour-testing` skill for how to test what you just wrote, and
`grand-tour` for product rules (guest limits, design tokens).
