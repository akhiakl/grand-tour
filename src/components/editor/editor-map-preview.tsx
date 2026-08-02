"use client";

import { useEffect, useState } from "react";

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
export function EditorMapPreview({ draft }: { readonly draft: DraftTrip }) {
  const debounced = useDebouncedDraft(draft);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (debounced.cities.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Add a stop to see it appear on the map.
        </p>
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
      selectedIndex={selectedIndex}
      onCitySelect={setSelectedIndex}
    />
  );
}
