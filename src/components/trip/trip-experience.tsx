"use client";

import { useState } from "react";

import { tripStats, type Trip } from "@/lib/trip";

import { CityDrawer } from "./city-drawer";
import { IntroSplash } from "./intro-splash";
import { Panels } from "./panels";
import { StatsStrip } from "./stats-strip";
import { TimelineRail } from "./timeline-rail";
import { TopBar, type PanelId } from "./top-bar";
import { TripMap } from "./trip-map";

/**
 * The immersive product view: full-bleed map with floating chrome —
 * topbar, stats, rail, panels, drawer. Receives the trip via props;
 * no data fetching happens below this line.
 */
export function TripExperience({ trip }: { trip: Trip }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [panel, setPanel] = useState<PanelId | null>(null);

  const stats = tripStats(trip);
  const route = trip.cities.map((city) => city.name).join(" → ");

  return (
    <div className="relative isolate h-dvh w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <TripMap trip={trip} selectedIndex={selected} onCitySelect={setSelected} />
      </div>

      <TopBar
        title={trip.title}
        eyebrow="Field Atlas"
        activePanel={panel}
        onTogglePanel={(id) => setPanel((current) => (current === id ? null : id))}
      />
      <StatsStrip trip={trip} />
      <Panels active={panel} />
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

      <IntroSplash
        title={trip.title}
        eyebrow={`${stats.nights} nights · ${stats.cities} cities · ${stats.countries} countries`}
        route={route}
      />
    </div>
  );
}
