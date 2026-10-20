"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ShareDialog } from "@/components/share/share-dialog";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useShareTrip } from "@/hooks/use-share-trip";
import { saveLocalTrip, tripStats, type Trip } from "@/lib/trip";

import { IntroSplash } from "./intro-splash";
import type { ExperienceVariant } from "./panel-actions";
import { PosterDialog } from "./poster-dialog";
import { TripMap } from "./trip-map";
import { TripPanel } from "./trip-panel";

const noop = () => {};

/**
 * The product view: the trip panel (sidebar from `lg`, bottom sheet
 * below) beside an uncluttered map. Receives the trip via props; no data
 * fetching happens below this line. Hosted by three pages, each passing
 * its own `actions` variant (see `ExperienceVariant`): the example route
 * (`/`), a Shared View (`/t/[id]`), and Map View (`/maps/[id]`).
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
  /** The landing's own primary actions, shown in place of the variant's. */
  readonly cta?: ReactNode;
}) {
  const router = useRouter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [selected, setSelected] = useState<number | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [sheetInset, setSheetInset] = useState(0);

  const stats = tripStats(trip);
  const route = trip.cities.map((city) => city.name).join(" → ");

  const { share, sharing, shareId, dialogOpen, setDialogOpen } = useShareTrip({
    // Local trips are already within the guest city limit by construction,
    // so the 403 branch this would gate is unreachable here.
    onCityLimit: noop,
  });

  // "Edit"/"Customize"/"Remix this trip" all copy the (possibly read-only)
  // trip into a local draft and open the editor. Owning a `localId` (Map
  // View) means updating that same record in place; otherwise (example
  // route, Shared View) it forks a fresh copy.
  const handleEditRoute = () => {
    const id = saveLocalTrip(
      { ...trip, createdAt: localId ? trip.createdAt : Date.now() },
      localId,
    );
    router.push(`/new?remix=${id}`);
  };

  return (
    <div className="relative isolate h-dvh w-full overflow-hidden lg:grid lg:grid-cols-[minmax(360px,26rem)_1fr] lg:grid-rows-[minmax(0,1fr)]">
      <TripPanel
        trip={trip}
        variant={actions}
        cta={cta}
        selected={selected}
        onSelect={setSelected}
        onEditRoute={handleEditRoute}
        onShare={() => void share(trip)}
        sharing={sharing}
        onPoster={() => setPosterOpen(true)}
        onInsetChange={setSheetInset}
      />

      <main aria-label="Route map" className="absolute inset-0 z-0 lg:relative">
        <TripMap
          trip={trip}
          selectedIndex={selected}
          onCitySelect={setSelected}
          bottomInset={isDesktop ? 0 : sheetInset}
        />
      </main>

      <PosterDialog trip={trip} open={posterOpen} onOpenChange={setPosterOpen} />
      {actions === "own" && (
        <ShareDialog
          shareId={shareId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}

      <IntroSplash
        title={trip.title}
        eyebrow={`${stats.nights} nights · ${stats.cities} cities · ${stats.countries} countries`}
        route={route}
      />
    </div>
  );
}
