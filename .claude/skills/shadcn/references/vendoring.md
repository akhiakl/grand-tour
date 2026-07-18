# Vendoring a shadcn component by hand

Use only when the registry is unreachable. The result must be
indistinguishable from CLI output so a later `shadcn add` diff stays clean.

## Procedure

1. Install the primitive's runtime deps at latest via CLI if missing
   (`pnpm add <pkg>`) — most Radix primitives already ship in the unified
   `radix-ui` package which is installed.
2. Create `src/components/ui/<component>.tsx` following the house pattern
   (see `button.tsx` as the canonical example):
   - Function components (no `forwardRef` — React 19), spread
     `React.ComponentProps<…>`.
   - `data-slot="<part-name>"` attribute on every rendered part.
   - Variants via `cva`; class merging via `cn()` from `@/lib/utils`.
   - Radix imports: `import { Dialog as DialogPrimitive } from "radix-ui"`
     then `DialogPrimitive.Root`, `DialogPrimitive.Trigger`, etc.
   - Export named parts (`Dialog`, `DialogTrigger`, `DialogContent`, …)
     plus any `…Variants` object.
3. Style with mapped tokens only (`bg-popover`, `text-muted-foreground`,
   `border-line`, `ring-ring`, …) — zero raw colors.
4. Open/close transitions with tw-animate-css data-state utilities, e.g.
   `data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`.

## Skeleton (overlay component)

```tsx
"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "frost fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-6",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Dialog, DialogContent /* + Trigger, Header, Title, … */ };
```

## Post-vendor checklist

- [ ] `pnpm lint && pnpm typecheck` green; file under 300 lines
- [ ] Both themes checked; tokens only, no hex
- [ ] ESC closes, focus trapped, focus returns to trigger
- [ ] `prefers-reduced-motion` honored (tw-animate-css respects it)
- [ ] Works with `asChild` where the CLI version supports it
