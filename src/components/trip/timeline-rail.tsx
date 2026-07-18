"use client";

import { Fragment } from "react";

import type { Leg, Trip } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { MODE_META } from "./mode";

function LegChip({ leg }: { leg: Leg }) {
  const { emoji, label } = MODE_META[leg.mode];
  return (
    <span className="flex shrink-0 flex-col items-center px-1 text-muted-foreground">
      <span aria-hidden className="text-sm leading-none">
        {emoji}
      </span>
      <span className="sr-only">{label}</span>
      <span className="mt-0.5 text-[10px] whitespace-nowrap">{leg.duration}</span>
    </span>
  );
}

export function TimelineRail({
  trip,
  selectedIndex,
  onSelect,
  className,
}: {
  trip: Trip;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <nav
      aria-label="Trip timeline"
      className={cn(
        "frost flex items-center gap-1 overflow-x-auto px-3 py-2.5",
        className,
      )}
    >
      {trip.cities.map((city, index) => (
        <Fragment key={`${city.name}-${index}`}>
          {index > 0 && <LegChip leg={trip.legs[index - 1]} />}
          <button
            type="button"
            onClick={() => onSelect(index)}
            aria-current={selectedIndex === index ? "step" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-sm transition-colors outline-none",
              "hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring",
              selectedIndex === index && "border-line bg-secondary",
            )}
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brass text-[11px] font-semibold text-paper dark:text-[#0e1420]">
              {index + 1}
            </span>
            <span className="font-medium whitespace-nowrap">{city.name}</span>
            <span className="text-xs whitespace-nowrap text-muted-foreground">
              {city.nights}n
            </span>
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
