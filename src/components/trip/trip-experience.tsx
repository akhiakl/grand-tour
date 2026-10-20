"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ShareDialog } from "@/components/share/share-dialog";
import { useShareTrip } from "@/hooks/use-share-trip";
import { saveLocalTrip, tripStats, type Trip } from "@/lib/trip";

import { CityDrawer } from "./city-drawer";
import { IntroSplash } from "./intro-splash";
import { Panels } from "./panels";
import { PosterDialog } from "./poster-dialog";
import { StatsStrip } from "./stats-strip";
import { TimelineRail } from "./timeline-rail";
import { TopBar, type ExperienceVariant, type PanelId } from "./top-bar";
import { TripMap } from "./trip-map";

const noop = () => {};

/**
 * The immersive product view: full-bleed map with floating chrome —
 * topbar, stats, rail, panels, drawer. Receives the trip via props;
 * no data fetching happens below this line. Hosted by three pages, each
 * passing its own `actions` variant (see `ExperienceVariant`): the Demo
 * Experience (`/`), a Shared View (`/t/[id]`), and Map View (`/maps/[id]`).
 */
export function TripExperience({
  trip,
  actions = "demo",
  localId,
  cta,
}: {
  readonly trip: Trip;
  readonly actions?: ExperienceVariant;
  /** The trip's local-store id, when `actions="own"` — lets "Edit" update
   * this same record in place instead of forking a new copy. */
  readonly localId?: string;
  /** Page-specific floating chrome (the landing CTA on `/`); hidden while
   * a city drawer is open so it never covers it on small screens. */
  readonly cta?: ReactNode;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);

  const stats = tripStats(trip);
  const route = trip.cities.map((city) => city.name).join(" → ");

  const { share, sharing, shareId, dialogOpen, setDialogOpen } = useShareTrip({
    // Local trips are already within the guest city limit by construction,
    // so the 403 branch this would gate is unreachable here.
    onCityLimit: noop,
  });

  // "Edit"/"Edit this route"/"Remix this trip" all copy the (possibly
  // read-only) trip into a local draft and open the editor. Owning a
  // `localId` (Map View) means updating that same record in place;
  // otherwise (Demo Experience, Shared View) it forks a fresh copy.
  const handleEditRoute = () => {
    const id = saveLocalTrip(
      { ...trip, createdAt: localId ? trip.createdAt : Date.now() },
      localId,
    );
    router.push(`/new?remix=${id}`);
  };

  return (
    <div className="relative isolate h-dvh w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <TripMap
          trip={trip}
          selectedIndex={selected}
          onCitySelect={setSelected}
          withChrome
        />
      </div>

      <TopBar
        title={trip.title}
        eyebrow="Field Atlas"
        activePanel={panel}
        onTogglePanel={(id) => setPanel((current) => (current === id ? null : id))}
        onPoster={() => setPosterOpen(true)}
        onEditRoute={handleEditRoute}
        onShare={() => void share(trip)}
        sharing={sharing}
        variant={actions}
      />
      <StatsStrip trip={trip} />
      <PosterDialog trip={trip} open={posterOpen} onOpenChange={setPosterOpen} />
      {actions === "own" && (
        <ShareDialog
          shareId={shareId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
      <Panels active={panel} />
      <TimelineRail trip={trip} selectedIndex={selected} onSelect={setSelected} />
      {selected === null && cta}

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
