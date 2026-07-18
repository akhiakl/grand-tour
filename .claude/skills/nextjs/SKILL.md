---
name: nextjs
description: Next.js App Router conventions for this repo. Use when creating pages, layouts, route handlers, metadata/OG images, or deciding server vs client component boundaries.
---

# Next.js conventions (App Router, v16+)

## Server vs client

- Server Components by default. Add `"use client"` only for interactivity
  (state, effects, event handlers, browser APIs, next-themes, Leaflet,
  Framer Motion).
- Push the client boundary as deep as possible: a server page composes small
  client leaves, not the other way round.
- localStorage access only inside client components, guarded behind
  mount/effect (never during render) to avoid hydration mismatch.

## Data & routes

- Route handlers live in `src/app/api/<name>/route.ts`; export typed
  `POST`/`GET`. Parse bodies with Zod before touching them; return typed
  JSON errors (`{ error: string }`) with correct status codes.
- Dynamic segment pages (`/t/[id]`) are async server components; `params`
  is a Promise in Next 15+ — `const { id } = await params;`.
- Use `notFound()` + a route-level `not-found.tsx` for missing/expired
  resources; design the page in-voice.
- `generateMetadata` for per-page titles (template `"%s · Grand Tour"` is
  set in the root layout) and `opengraph-image.tsx` with `next/og` for
  share cards.

## Assets & fonts

- Fonts only via `next/font/google` with `variable:` CSS custom properties
  (already wired: Fraunces + Outfit in `src/app/layout.tsx`).
- Client-only libraries (Leaflet): `next/dynamic` with `ssr: false`,
  and provide a sized fallback to prevent layout shift.

## Gotchas

- `suppressHydrationWarning` stays on `<html>` (next-themes mutates class).
- Never import server-only modules (Redis client, Groq key usage) from
  client components; keep them under `src/lib` and import only in route
  handlers/server components.
- Prefer `redirect()`/`notFound()` over client-side navigation for server
  decisions.
