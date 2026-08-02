import {
  DEFAULT_TRIP_TITLE,
  GUEST_MAX_CITIES,
  TripSchema,
  type City,
  type Leg,
  type Trip,
} from "./schema";

/**
 * Editing-time trip shape: looser than `Trip` (no `v`/`createdBy`/
 * `createdAt`, cities may be 0–{@link GUEST_MAX_CITIES} long) so the
 * manual editor can hold in-progress state that isn't schema-valid yet.
 * Pure, framework-free transforms live here so they're cheaply unit-tested
 * and the editor components stay thin.
 */
export type DraftTrip = {
  title: string;
  cities: City[];
  legs: Leg[];
};

const defaultLeg = (): Leg => ({ mode: "train", label: "", duration: "" });

/** Rebuilds legs to `cities.length - 1`, reusing existing legs positionally. */
function rebuildLegs(cities: City[], legs: Leg[]): Leg[] {
  const targetLength = Math.max(cities.length - 1, 0);
  return Array.from({ length: targetLength }, (_, i) => legs[i] ?? defaultLeg());
}

export function createBlankDraft(): DraftTrip {
  return { title: DEFAULT_TRIP_TITLE, cities: [], legs: [] };
}

export function draftFromTrip(trip: Trip): DraftTrip {
  return { title: trip.title, cities: trip.cities, legs: trip.legs };
}

export function canAddCity(draft: DraftTrip): boolean {
  return draft.cities.length < GUEST_MAX_CITIES;
}

export function addCity(draft: DraftTrip, city: City): DraftTrip {
  if (!canAddCity(draft)) return draft;
  const cities = [...draft.cities, city];
  return { ...draft, cities, legs: rebuildLegs(cities, draft.legs) };
}

export function removeCityAt(draft: DraftTrip, index: number): DraftTrip {
  const cities = draft.cities.filter((_, i) => i !== index);
  return { ...draft, cities, legs: rebuildLegs(cities, draft.legs) };
}

export function moveCity(draft: DraftTrip, from: number, to: number): DraftTrip {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= draft.cities.length ||
    to >= draft.cities.length
  ) {
    return draft;
  }
  const cities = [...draft.cities];
  const [moved] = cities.splice(from, 1);
  cities.splice(to, 0, moved);
  return { ...draft, cities, legs: rebuildLegs(cities, draft.legs) };
}

export function updateCityAt(
  draft: DraftTrip,
  index: number,
  patch: Partial<City>,
): DraftTrip {
  const cities = draft.cities.map((city, i) =>
    i === index ? { ...city, ...patch } : city,
  );
  return { ...draft, cities };
}

export function updateLegAt(
  draft: DraftTrip,
  index: number,
  patch: Partial<Leg>,
): DraftTrip {
  const legs = draft.legs.map((leg, i) =>
    i === index ? { ...leg, ...patch } : leg,
  );
  return { ...draft, legs };
}

export function updateTitle(draft: DraftTrip, title: string): DraftTrip {
  return { ...draft, title };
}

/** Cities ≥ 2 is the only gate the editor cares about — schema re-checks the rest. */
export function isShareable(draft: DraftTrip): boolean {
  return draft.cities.length >= 2 && draft.title.trim().length > 0;
}

/**
 * Stamps a draft into a schema-shaped `Trip` for preview/persistence.
 * Returns null while the draft doesn't yet meet the schema (e.g. < 2
 * cities) — callers use this to gate the map preview, autosave and share.
 * Pass the draft's original `createdAt` (from local store or a fresh
 * `Date.now()` for a brand-new draft) so repeat autosaves don't drift it.
 */
export function draftToTrip(draft: DraftTrip, createdAt: number): Trip | null {
  const candidate = {
    v: 1 as const,
    title: draft.title,
    cities: draft.cities,
    legs: draft.legs,
    createdBy: "guest" as const,
    createdAt,
  };
  const parsed = TripSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
