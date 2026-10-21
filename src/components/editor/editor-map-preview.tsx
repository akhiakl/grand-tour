"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { placeGhostStops } from "@/lib/ai";
import type { DraftTrip, Trip } from "@/lib/trip";

import { TripMap } from "../trip/trip-map";

const PREVIEW_DEBOUNCE_MS = 400;

function useDebouncedDraft(draft: DraftTrip): DraftTrip {
  const [debounced, setDebounced] = useState(draft);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(draft), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft]);

  return debounced;
}

/**
 * Live map preview: reuses `TripMap`, which only reads `title`/`cities`/
 * `legs` at render time, so a draft with 1+ cities can drive it directly
 * without passing the full `TripSchema` gate that `draftToTrip` enforces.
 */
export function EditorMapPreview({
  draft,
  ghostNames = [],
  onGhostSelect,
  selectedIndex,
  onCitySelect,
}: {
  readonly draft: DraftTrip;
  /** The stop being edited; the map flies to it. */
  readonly selectedIndex: number | null;
  readonly onCitySelect: (index: number) => void;
  /** AI overflow stops; never saved with the trip. */
  readonly ghostNames?: readonly string[];
  readonly onGhostSelect?: () => void;
}) {
  const t = useTranslations("Editor");
  const debounced = useDebouncedDraft(draft);
  // Placed from the same debounced draft as the route, so the ghost fan
  // moves together with the route's end while the guest edits.
  const ghosts = useMemo(
    () => placeGhostStops(debounced.cities, ghostNames),
    [debounced.cities, ghostNames],
  );

  if (debounced.cities.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("previewEmpty")}</p>
      </div>
    );
  }

  const previewTrip = {
    v: 1,
    title: debounced.title,
    cities: debounced.cities,
    legs: debounced.legs,
    createdBy: "guest",
    createdAt: 0,
  } as Trip;

  return (
    <TripMap
      trip={previewTrip}
      // The debounced draft can briefly have fewer stops than the live one.
      selectedIndex={
        selectedIndex !== null && selectedIndex < debounced.cities.length
          ? selectedIndex
          : null
      }
      onCitySelect={onCitySelect}
      ghosts={ghosts}
      onGhostSelect={onGhostSelect}
    />
  );
}
