"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { ToolId } from "./panel-actions";

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

/** Return link shared by every panel view that replaces the itinerary. */
export function BackToRoute({ onBack }: { readonly onBack: () => void }) {
  return (
    <button
      type="button"
      autoFocus
      onClick={onBack}
      className="-ml-1 flex w-fit items-center gap-1.5 rounded-full px-1 text-sm text-ink-soft transition-colors outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
    >
      <ArrowLeft /> Route
    </button>
  );
}

function ToolSection({
  open,
  title,
  onBack,
  children,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly onBack: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <section hidden={!open} className="flex flex-col gap-4">
      {open && <BackToRoute onBack={onBack} />}
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Packing checklist and notes. Both stay mounted (hidden when inactive)
 * so ticks and text survive switching back to the route.
 */
export function TripTools({
  active,
  onBack,
}: {
  readonly active: ToolId | null;
  readonly onBack: () => void;
}) {
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
      <ToolSection
        open={active === "packing"}
        title="Packing checklist"
        onBack={onBack}
      >
        <div className="h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brass transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="space-y-2.5">
          {PACKING.map((item, index) => {
            const id = `packing-${index}`;
            return (
              <li key={item}>
                <div className="flex items-center gap-3 text-sm">
                  <Checkbox
                    id={id}
                    checked={checked.has(item)}
                    onCheckedChange={() => toggle(item)}
                  />
                  <label
                    htmlFor={id}
                    className={cn(
                      "cursor-pointer",
                      checked.has(item) && "text-muted-foreground line-through",
                    )}
                  >
                    {item}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </ToolSection>

      <ToolSection open={active === "notes"} title="Trip notes" onBack={onBack}>
        <textarea
          aria-label="Trip notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Booking codes, addresses, ideas…"
          className="min-h-48 w-full resize-y rounded-lg border border-line bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </ToolSection>
    </>
  );
}
