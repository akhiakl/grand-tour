"use client";

import { useState } from "react";

import type { Trip } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { CityDrawer } from "./city-drawer";
import { TimelineRail } from "./timeline-rail";
import { TripMap } from "./trip-map";

/**
 * The core product view: map + timeline + city drawer, wired together.
 * Receives the trip via props — no data fetching happens below this line.
 */
export function TripExperience({
  trip,
  className,
}: {
  trip: Trip;
  className?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className={cn("flex min-h-0 flex-col gap-4", className)}>
      {/* `isolate` fences Leaflet's high pane z-indexes inside the frame. */}
      <div className="relative isolate min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-line shadow-soft">
        <TripMap trip={trip} selectedIndex={selected} onCitySelect={setSelected} />
      </div>

      <TimelineRail trip={trip} selectedIndex={selected} onSelect={setSelected} />

      <CityDrawer
        city={selected === null ? null : trip.cities[selected]}
        index={selected ?? 0}
        count={trip.cities.length}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
