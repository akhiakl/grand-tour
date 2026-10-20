"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ShareDialog } from "@/components/share/share-dialog";
import { useShareTrip } from "@/hooks/use-share-trip";
import {
  saveLocalTrip,
  tripStats,
  type Trip,
  type TripToolsScope,
} from "@/lib/trip";

import type { MapInsets } from "./fit-padding";
import { IntroSplash } from "./intro-splash";
import type { ExperienceVariant } from "./panel-actions";
import { PosterDialog } from "./poster-dialog";
import { TripMap } from "./trip-map";
import { TripPanel } from "./trip-panel";

const noop = () => {};

/** Where a viewer's packing and notes are saved for the hosting page. */
function toolsScopeFor(
  actions: ExperienceVariant,
  ids: { localId?: string; shareId?: string },
): TripToolsScope {
  if (actions === "shared" && ids.shareId)
    return { kind: "shared", id: ids.shareId };
  if (actions === "own" && ids.localId) return { kind: "local", id: ids.localId };
  return { kind: "demo" };
}

/**
 * The product view: a full-bleed map with one floating atlas card (the
 * trip panel: top-left from `lg`, a bottom sheet below) over it; the card
 * reports the map `insets` it covers so fits and focus pans stay clear.
 * Receives the trip via props; no data fetching happens below this line. Hosted by three pages, each passing
 * its own `actions` variant (see `ExperienceVariant`): the example route
 * (`/`), a Shared View (`/t/[id]`), and Map View (`/maps/[id]`).
 */
export function TripExperience({
  trip,
  actions = "demo",
  localId,
  shareId,
  cta,
}: {
  readonly trip: Trip;
  readonly actions?: ExperienceVariant;
  /** The trip's local-store id, when `actions="own"` — lets "Edit" update
   * this same record in place instead of forking a new copy. */
  readonly localId?: string;
  /** The snapshot id, when `actions="shared"` (`/t/{id}`). */
  readonly shareId?: string;
  /** The landing's own primary actions, shown in place of the variant's. */
  readonly cta?: ReactNode;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  // The stop under the pointer/focus, mirrored between list row and marker.
  const [hovered, setHovered] = useState<number | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [insets, setInsets] = useState<MapInsets>({});
  const [sheetOpen, setSheetOpen] = useState(false);

  // Picking a stop (map or itinerary) opens the sheet to show its detail.
  // The list it was hovered in goes away, so drop the hover with it.
  const selectCity = (index: number | null) => {
    setSelected(index);
    setHovered(null);
    if (index !== null) setSheetOpen(true);
  };

  const stats = tripStats(trip);
  const toolsScope = toolsScopeFor(actions, { localId, shareId });
  const route = trip.cities.map((city) => city.name).join(" → ");

  const {
    share,
    sharing,
    shareId: sharedId,
    dialogOpen,
    setDialogOpen,
  } = useShareTrip({
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
    <div className="relative isolate h-dvh w-full overflow-hidden">
      <TripPanel
        trip={trip}
        toolsScope={toolsScope}
        variant={actions}
        cta={cta}
        selected={selected}
        onSelect={selectCity}
        hovered={hovered}
        onHover={setHovered}
        onEditRoute={handleEditRoute}
        onShare={() => void share(trip)}
        sharing={sharing}
        onPoster={() => setPosterOpen(true)}
        onInsetsChange={setInsets}
        expanded={sheetOpen}
        onExpandedChange={setSheetOpen}
      />

      <main aria-label="Route map" className="absolute inset-0 z-0">
        <TripMap
          trip={trip}
          selectedIndex={selected}
          onCitySelect={selectCity}
          hoveredIndex={hovered}
          onCityHover={setHovered}
          onBackgroundClick={() => setSheetOpen(false)}
          insets={insets}
        />
      </main>

      <PosterDialog trip={trip} open={posterOpen} onOpenChange={setPosterOpen} />
      {actions === "own" && (
        <ShareDialog
          shareId={sharedId}
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
