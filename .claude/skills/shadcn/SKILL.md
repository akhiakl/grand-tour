---
name: shadcn
description: shadcn/ui usage rules for this repo. Use when adding UI primitives (dialogs, drawers, tabs, inputs, dropdowns), restyling ui components, or deciding how to source a new component (registry vs vendoring).
---

# shadcn/ui conventions

## Sourcing a component (decision tree)

1. **shadcn MCP available?** (`.mcp.json` configures it) Use it first:
   - `search_items_in_registries` / `list_items_in_registries` — find items
   - `view_items_in_registries` — inspect files before installing
   - `get_item_examples_from_registries` — usage examples/demos
   - `get_add_command_for_items` — exact `pnpm dlx shadcn@latest add …`
   - `get_audit_checklist` — run after adding components
2. **CLI**: `pnpm dlx shadcn@latest add <component>` (config in
   `components.json`; components land in `src/components/ui`).
3. **Registry unreachable** (restricted network — `ui.shadcn.com` blocked):
   vendor the component manually. Follow
   [references/vendoring.md](references/vendoring.md) exactly.

Which primitives each Phase-1 feature needs is mapped in
[references/phase-1-components.md](references/phase-1-components.md).

## Theming

- All shadcn color tokens (`--primary`, `--card`, `--border`, …) are mapped
  to the brand palette in `src/app/globals.css`. Restyle by adjusting the
  mapping — never fork a component just to change colors, never hardcode
  hex in a component.
- Button variants: `default` (ink), `brass` (signature CTA), `outline`,
  `ghost`, `link` (azure), `destructive`. Add new variants to the `cva`
  config rather than overriding with long className strings at call sites.
- Radii come from `--radius` (`rounded-sm/md/lg/xl` map to the 14–20px
  brand range); shadows via `--shadow-soft`.

## Composition rules

- ui/ components are dumb primitives: no data fetching, no business logic,
  no app-specific copy. Compose them inside feature components
  (`src/components/...`).
- Keep the `asChild` pattern working when wrapping (`Slot.Root` from the
  unified `radix-ui` package).
- Overlays (Dialog/Sheet) must keep their built-in focus trap and ESC
  behavior — never disable `onEscapeKeyDown`; the guest upsell modal and
  city drawer depend on it for the accessibility bar.
- Icons: lucide-react, sized by the component's `[&_svg]:size-*` rules —
  don't set explicit width/height on icons inside buttons.
- Animate overlay entrances with tw-animate-css utilities already used by
  shadcn (`data-[state=open]:animate-in …`) — Framer Motion is for product
  motion (route drawing, drawers content), not primitive open/close.
