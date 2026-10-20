# Phase-1 feature → shadcn component map

Install (or vendor) primitives only when the feature that needs them is
being built — not speculatively.

| Feature (build step) | Primitives                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| CityDetail (3)       | `tabs` (Overview/Days/Food/Practical/Planner), `checkbox` (planner checklist); shown inside the trip panel |
| Itinerary (3)        | plain list in the trip panel (no primitive needed)                                                         |
| Manual editor (4)    | `input`, `textarea`, `label`, `select` (leg mode picker), `dropdown-menu` (row actions), `sonner` (toasts) |
| My Maps (4)          | `card`, `alert-dialog` (confirm delete)                                                                    |
| Share flow (5)       | `dialog` (share sheet), `input` (copy link)                                                                |
| AI chat (6)          | `input`, `skeleton` (generation loading)                                                                   |
| UpsellModal (2/4/6)  | `dialog`, `badge` (locked-feature markers)                                                                 |
| Landing (7)          | `button` (already vendored), `badge`                                                                       |

## Commands

```bash
# preferred (registry reachable)
pnpm dlx shadcn@latest add sheet tabs dialog input label select

# check what an item contains before adding (MCP)
# view_items_in_registries(["@shadcn/sheet"])
```

## House rules recap

- City detail lives in the trip panel (not a `Sheet`); the panel handles
  ESC (back to route, then collapse the mobile sheet).
- `AlertDialog` for destructive confirms (delete map) — `destructive`
  button variant inside.
- Toasts via `sonner` are brief and in-voice ("Map shared — link copied").
- Any primitive not listed here needs a justification in the PR
  description.
