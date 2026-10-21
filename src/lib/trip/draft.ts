import { suggestLeg } from "./leg-estimate";
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
  /** YYYY-MM-DD, or absent for an undated trip. */
  startDate?: string;
};

const MAX_NIGHTS = 30;

/**
 * Rebuilds legs to `cities.length - 1`, reusing existing legs positionally;
 * a newly needed leg is drafted from the distance between its stops.
 */
function rebuildLegs(cities: City[], legs: Leg[]): Leg[] {
  const targetLength = Math.max(cities.length - 1, 0);
  return Array.from(
    { length: targetLength },
    (_, i) => legs[i] ?? suggestLeg(cities[i], cities[i + 1]),
  );
}

/** A stop with only placeholders filled in; callers set what they know. */
export function blankCity(name = ""): City {
  return {
    name,
    country: "",
    flag: "",
    ll: [0, 0],
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

export function createBlankDraft(): DraftTrip {
  return { title: DEFAULT_TRIP_TITLE, cities: [], legs: [] };
}

export function draftFromTrip(trip: Trip): DraftTrip {
  const { title, cities, legs, startDate } = trip;
  return startDate ? { title, cities, legs, startDate } : { title, cities, legs };
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

/** Where a stop at `index` sits after the stop at `from` moves to `to`. */
export function indexAfterMove(index: number, from: number, to: number): number {
  if (index === from) return to;
  if (from < to && index > from && index <= to) return index - 1;
  if (from > to && index >= to && index < from) return index + 1;
  return index;
}

/** Where a stop at `index` sits after `removed` is deleted; null if it was the one. */
export function indexAfterRemove(index: number, removed: number): number | null {
  if (index === removed) return null;
  return index > removed ? index - 1 : index;
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

/** Coerces raw nights input (empty, fractional, out of range) into 0–30. */
export function clampNights(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_NIGHTS, Math.max(0, Math.trunc(value)));
}

export function updateTitle(draft: DraftTrip, title: string): DraftTrip {
  return { ...draft, title };
}

/** Sets the first day (YYYY-MM-DD); an empty value makes the trip undated. */
export function updateStartDate(draft: DraftTrip, startDate: string): DraftTrip {
  const { title, cities, legs } = draft;
  return startDate ? { title, cities, legs, startDate } : { title, cities, legs };
}

/**
 * Cities ≥ 2 is the only gate that disables Share — field-level problems
 * are reported by {@link draftIssues} so the editor can point at them.
 */
export function isShareable(draft: DraftTrip): boolean {
  return draft.cities.length >= 2;
}

/** Why a field is invalid, as a message key the editor translates. */
export type DraftIssueKey =
  "titleRequired" | "nameRequired" | "nightsRange" | "startDateInvalid" | "invalid";

/** Field paths the editor renders inline, keyed like `cities.0.name`. */
export type DraftIssues = Record<string, DraftIssueKey>;

const FIELD_ISSUES: Record<string, DraftIssueKey> = {
  title: "titleRequired",
  name: "nameRequired",
  nights: "nightsRange",
  startDate: "startDateInvalid",
};

/**
 * Field-level schema problems in a draft, one per field. Skips the
 * trip-wide count/legs rules: the stop counter and Share gate already
 * cover those, and they have no single field to point at.
 */
export function draftIssues(draft: DraftTrip): DraftIssues {
  const parsed = TripSchema.safeParse(toCandidate(draft, 0));
  if (parsed.success) return {};

  const issues: DraftIssues = {};
  for (const issue of parsed.error.issues) {
    const topLevelField = issue.path[0] === "title" || issue.path[0] === "startDate";
    if (issue.path.length === 1 && !topLevelField) continue;
    const key = issue.path.join(".");
    const field = String(issue.path.at(-1));
    issues[key] ??= FIELD_ISSUES[field] ?? "invalid";
  }
  return issues;
}

function toCandidate(draft: DraftTrip, createdAt: number) {
  return {
    v: 1 as const,
    title: draft.title,
    cities: draft.cities,
    legs: draft.legs,
    ...(draft.startDate ? { startDate: draft.startDate } : {}),
    createdBy: "guest" as const,
    createdAt,
  };
}

/**
 * Stamps a draft into a schema-shaped `Trip` for preview/persistence.
 * Returns null while the draft doesn't yet meet the schema (e.g. < 2
 * cities) — callers use this to gate the map preview, autosave and share.
 * Pass the draft's original `createdAt` (from local store or a fresh
 * `Date.now()` for a brand-new draft) so repeat autosaves don't drift it.
 */
export function draftToTrip(draft: DraftTrip, createdAt: number): Trip | null {
  const parsed = TripSchema.safeParse(toCandidate(draft, createdAt));
  return parsed.success ? parsed.data : null;
}
