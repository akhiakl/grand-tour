---
name: tailwind
description: Tailwind CSS v4 usage rules for this repo. Use when styling components, adding design tokens, or touching globals.css.
---

# Tailwind v4 conventions

## Setup facts

- Tailwind v4 CSS-first config: there is NO tailwind.config file. Tokens are
  CSS variables in `src/app/globals.css`, exposed to utilities via
  `@theme inline`.
- Dark mode is class-based through next-themes:
  `@custom-variant dark (&:is(.dark *))` — style dark with the `dark:`
  variant or rely on tokens that already flip (preferred).

## Rules

- **Tokens only.** `bg-paper`, `text-ink`, `text-ink-soft`, `text-brass`,
  `text-azure`, `border-line`, plus the shadcn-mapped set
  (`bg-background`, `text-muted-foreground`, `bg-card`, `ring-ring`, …).
  Never hardcode hex/rgb in components — if a value is missing, add a token
  to globals.css first.
- Prefer token-flipping over `dark:` sprinkling: because brand variables
  change under `.dark`, most components need zero dark-mode classes.
- House utilities: `.frost` for frosted surfaces, `.eyebrow` for brass
  caption labels — reuse, don't re-implement.
- Type: `font-display` = Fraunces (headings/display), default `font-sans` =
  Outfit. Radii via `rounded-lg`/`rounded-xl` (mapped to the 14–20px brand
  range) — no arbitrary radius values.
- Class merging in components: always through `cn()` from `src/lib/utils`
  (clsx + tailwind-merge); variants via `cva`.
- Responsive: mobile-first breakpoints; avoid fixed pixel widths — use
  `max-w-*`, grid/flex, and container padding patterns.
- Arbitrary values (`[...]`) are a last resort; if used twice, promote to a
  token or utility.
