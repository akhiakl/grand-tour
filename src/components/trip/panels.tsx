"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { PanelId } from "./top-bar";

const PACKING = [
  "Passport & ID",
  "EU power adapter",
  "Comfortable walking shoes",
  "Rail tickets saved offline",
  "Refillable water bottle",
  "Light rain layer",
  "Modest cover for churches",
  "Power bank",
  "Day pack",
];

function PanelShell({
  open,
  title,
  children,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "frost fixed top-24 right-4 z-[55] max-h-[60vh] w-[300px] max-w-[calc(100vw-2rem)] overflow-y-auto p-5 sm:right-7",
        !open && "hidden",
      )}
    >
      <h4 className="mb-3 font-display text-lg font-medium">{title}</h4>
      {children}
    </section>
  );
}

export function Panels({ active }: { active: PanelId | null }) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [notes, setNotes] = useState("");

  const toggle = (item: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  const progress = Math.round((checked.size / PACKING.length) * 100);

  return (
    <>
      <PanelShell open={active === "packing"} title="Packing checklist">
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brass transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="space-y-2.5">
          {PACKING.map((item) => (
            <li key={item}>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={checked.has(item)}
                  onCheckedChange={() => toggle(item)}
                />
                <span
                  className={
                    checked.has(item)
                      ? "text-muted-foreground line-through"
                      : undefined
                  }
                >
                  {item}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </PanelShell>

      <PanelShell open={active === "notes"} title="Trip notes">
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Booking codes, addresses, ideas…"
          className="min-h-[140px] w-full resize-y rounded-lg border border-line bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </PanelShell>
    </>
  );
}
