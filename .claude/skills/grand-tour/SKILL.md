---
name: grand-tour
description: Project skill for the Grand Tour travel-route-map app. Use when building or modifying any feature in this repo — pages, components, API routes, schema, or design work — to apply the field-atlas design system, the trip data model, guest limits, and the service-layer architecture correctly.
---

# Grand Tour project skill

## What this app is

Shareable AI travel route maps. Guest-first: no accounts. A trip = ordered
cities + connecting legs, rendered as an interactive Leaflet map with city
drawers and a timeline rail. Share = immutable Redis snapshot at `/t/{id}`
(60-day sliding TTL). Creator's editable copies live in localStorage.

## Non-negotiables (check before writing code)

1. `GUEST_MAX_CITIES = 5` — server-side Zod gate in `POST /api/trips`
   (403 `{ error: 'city_limit', limit: 5 }`), editor counter + upsell modal,
   AI prompt constraint with `suggestedExtra` ghost stops.
2. Max 300 lines/file (tests exempt). Split by responsibility.
3. All external data through Zod (`src/lib/schema.ts`). 50KB payload cap.
4. `src/lib/trips.ts` stays plain functions; only route handlers/server
   components touch it. UI gets data via props.
5. Default trip title: "Grand Tour" (`DEFAULT_TRIP_TITLE`); users may set a
   custom title (max 80 chars).
6. Colocated unit tests written with the code, not after.

## Design recipes

- Surface: `<div className="frost p-6">` — never hand-roll card styles.
- Label: `<p className="eyebrow">Itinerary</p>`.
- Display type: `font-display` (Fraunces), italics for emphasis accents
  (`<em className="font-display italic text-brass">`).
- Color: only token utilities — `bg-paper`, `text-ink`, `text-ink-soft`
  (or `text-muted-foreground`), `text-brass`, `text-azure`, `border-line`.
- Motion: `transition={{ ease: [0.32, 0.72, 0.24, 1] }}`; wrap distance
  animations in `useReducedMotion()` checks.
- Buttons: shadcn `Button` — `variant="brass"` for the primary product CTA,
  `default` (ink) for standard actions, `outline`/`ghost` for secondary.
- Map: CartoDB Voyager tiles; light = desaturated CSS filter, dark =
  invert + hue-rotate; route drawn as brass SVG path animating `pathLength`
  city-to-city; leg badges 🚄/🚆/🚌/✈ at midpoints; `minZoom 5`,
  `maxZoom 12`, `maxBoundsViscosity: 1.0`, fitBounds with padding.
- Leaflet only via `next/dynamic` with `ssr: false`.

## API surface (Phase 1)

- `POST /api/trips` — ratelimit 10/h/IP → Zod → city limit → `saveTrip` →
  `{ id }`.
- `POST /api/generate` — ratelimit 5/h/IP → Groq `llama-3.3-70b-versatile`
  JSON mode → Zod parse → one retry with validation errors appended →
  Trip (not saved).
- `GET /t/[id]` — server component; `getTrip` (TTL refresh) + `incrViews`;
  expired → friendly in-voice page with create CTA. `generateMetadata` +
  `opengraph-image.tsx` required.

## Checklists

Before committing: `pnpm lint && pnpm typecheck && pnpm test` green;
keyboard access (ESC, focus trap) for any overlay; loading/error/empty
states styled in-voice; both themes checked; reduced motion respected.
