import type { CitySearchResult } from "@/lib/geo-search";

import { DEFAULT_TRIP_TITLE, GUEST_MAX_CITIES } from "./schema";
import type { City, Leg, Trip } from "./schema";

/** A fresh, unsaved trip draft — deliberately schema-invalid (0 cities) until the guest adds stops. */
export function createBlankTrip(): Trip {
  return {
    v: 1,
    title: DEFAULT_TRIP_TITLE,
    cities: [],
    legs: [],
    createdBy: "guest",
    createdAt: Date.now(),
  };
}

/** Fresh city from a geo-search pick — the rich fields start empty for the guest to fill in. */
export function createDraftCity(result: CitySearchResult): City {
  return {
    name: result.name,
    country: result.country,
    flag: result.flag,
    ll: result.ll,
    nights: 1,
    why: "",
    must: [],
    gems: [],
    food: [],
    days: [],
    budget: [0, 0],
    transport: "",
    stay: "",
    tips: [],
  };
}

export function createDraftLeg(): Leg {
  return { mode: "train", label: "", duration: "" };
}

/** Keeps `legs.length === cities.length - 1`, trimming or padding with defaults. */
export function rebuildLegs(cities: City[], legs: Leg[]): Leg[] {
  const needed = Math.max(cities.length - 1, 0);
  if (legs.length === needed) return legs;
  if (legs.length > needed) return legs.slice(0, needed);
  return [...legs, ...Array.from({ length: needed - legs.length }, createDraftLeg)];
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export type DraftAction =
  | { type: "setTitle"; title: string }
  | { type: "addCity"; result: CitySearchResult }
  | { type: "removeCity"; index: number }
  | { type: "reorderCities"; from: number; to: number }
  | { type: "updateCity"; index: number; patch: Partial<City> }
  | { type: "updateLeg"; index: number; patch: Partial<Leg> };

export function draftReducer(trip: Trip, action: DraftAction): Trip {
  switch (action.type) {
    case "setTitle":
      return { ...trip, title: action.title };

    case "addCity": {
      if (trip.cities.length >= GUEST_MAX_CITIES) return trip;
      const cities = [...trip.cities, createDraftCity(action.result)];
      return { ...trip, cities, legs: rebuildLegs(cities, trip.legs) };
    }

    case "removeCity": {
      const cities = trip.cities.filter((_, index) => index !== action.index);
      return { ...trip, cities, legs: rebuildLegs(cities, trip.legs) };
    }

    case "reorderCities": {
      const cities = moveItem(trip.cities, action.from, action.to);
      return { ...trip, cities, legs: rebuildLegs(cities, trip.legs) };
    }

    case "updateCity": {
      const cities = trip.cities.map((city, index) =>
        index === action.index ? { ...city, ...action.patch } : city,
      );
      return { ...trip, cities };
    }

    case "updateLeg": {
      const legs = trip.legs.map((leg, index) =>
        index === action.index ? { ...leg, ...action.patch } : leg,
      );
      return { ...trip, legs };
    }

    default:
      return trip;
  }
}
