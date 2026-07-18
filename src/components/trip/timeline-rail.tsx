"use client";

import { Fragment } from "react";

import type { Leg, Trip } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { MODE_META } from "./mode";

function LegChip({ leg }: { readonly leg: Leg }) {
  const { emoji, label } = MODE_META[leg.mode];
  return (
    <span className="flex shrink-0 flex-col items-center self-center px-1.5 text-muted-foreground">
      <span aria-hidden className="text-[13px] leading-none opacity-80">
        {emoji}
      </span>
      <span className="sr-only">{label}</span>
      <span className="mt-0.5 text-[9px] tracking-wide whitespace-nowrap">
        {leg.duration}
      </span>
    </span>
  );
}

export function TimelineRail({
  trip,
  selectedIndex,
  onSelect,
}: {
  readonly trip: Trip;
  readonly selectedIndex: number | null;
  readonly onSelect: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Trip timeline"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5"
    >
      <div className="frost pointer-events-auto flex max-w-full items-stretch overflow-x-auto rounded-[20px] px-2.5 py-3">
        {trip.cities.map((city, index) => (
          <Fragment key={`${city.name}-${index}`}>
            {index > 0 && <LegChip leg={trip.legs[index - 1]} />}
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={selectedIndex === index ? "step" : undefined}
              className={cn(
                "flex min-w-[96px] shrink-0 flex-col items-center gap-1 rounded-[14px] px-4 py-1.5 transition-colors outline-none",
                "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                selectedIndex === index && "bg-accent",
              )}
            >
              <span aria-hidden className="text-lg leading-none">
                {city.flag}
              </span>
              <span className="font-display text-[15px] font-medium whitespace-nowrap">
                {city.name}
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-[0.14em] uppercase",
                  selectedIndex === index
                    ? "font-semibold text-brass"
                    : "text-muted-foreground",
                )}
              >
                {city.nights} night{city.nights === 1 ? "" : "s"}
              </span>
            </button>
          </Fragment>
        ))}
      </div>
    </nav>
  );
}
