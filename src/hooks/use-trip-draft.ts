import { nanoid } from "nanoid";
import { useReducer, useState } from "react";

import type { CitySearchResult } from "@/lib/geo-search";
import { GUEST_MAX_CITIES, draftReducer } from "@/lib/trip";
import type { City, Leg, Trip } from "@/lib/trip";

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Wraps the pure `draftReducer` with a UI-only, position-synced id per stop
 * — dnd-kit needs a stable identity per item that survives reorders, and the
 * `City` schema itself has no id field to persist one on.
 */
export function useTripDraft(initial: Trip) {
  const [trip, dispatch] = useReducer(draftReducer, initial);
  const [stopIds, setStopIds] = useState(() => initial.cities.map(() => nanoid(6)));

  return {
    trip,
    stopIds,
    atLimit: trip.cities.length >= GUEST_MAX_CITIES,
    setTitle: (title: string) => dispatch({ type: "setTitle", title }),
    addCity: (result: CitySearchResult) => {
      dispatch({ type: "addCity", result });
      setStopIds((ids) => [...ids, nanoid(6)]);
    },
    removeCity: (index: number) => {
      dispatch({ type: "removeCity", index });
      setStopIds((ids) => ids.filter((_, i) => i !== index));
    },
    reorderCities: (from: number, to: number) => {
      dispatch({ type: "reorderCities", from, to });
      setStopIds((ids) => moveItem(ids, from, to));
    },
    updateCity: (index: number, patch: Partial<City>) =>
      dispatch({ type: "updateCity", index, patch }),
    updateLeg: (index: number, patch: Partial<Leg>) =>
      dispatch({ type: "updateLeg", index, patch }),
  };
}
