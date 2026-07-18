---
name: shadcn
description: shadcn/ui usage rules for this repo. Use when adding UI primitives (dialogs, drawers, tabs, inputs, dropdowns) or restyling existing ui components.
---

# shadcn/ui conventions

## Adding components

- Preferred: `pnpm dlx shadcn@latest add <component>` (config in
  `components.json`; components land in `src/components/ui`).
- If the registry is unreachable (restricted network), vendor the component
  manually in `src/components/ui` following the same patterns as
  `button.tsx`: `data-slot` attributes, `cva` variants, `cn()` merging,
  primitives from the unified `radix-ui` package
  (`import { Slot } from "radix-ui"`).

## Theming

- All shadcn color tokens (`--primary`, `--card`, `--border`, …) are mapped
  to the brand palette in `globals.css`. Restyle by adjusting the mapping —
  never fork a component just to change colors.
- Button variants: `default` (ink), `brass` (signature CTA), `outline`,
  `ghost`, `link` (azure), `destructive`. Add new variants to the `cva`
  config rather than overriding with long className strings at call sites.

## Composition rules

- ui/ components are dumb primitives: no data fetching, no business logic,
  no app-specific copy. Compose them inside feature components
  (`src/components/...`).
- Keep the `asChild` pattern working when wrapping (`Slot.Root`).
- Overlays (Dialog/Sheet) must keep their built-in focus trap and ESC
  behavior — never disable `onEscapeKeyDown`; the guest upsell modal and
  city drawer depend on it for the accessibility bar.
- Icons: lucide-react, sized by the component's `[&_svg]:size-*` rules —
  don't set explicit width/height on icons inside buttons.
