import { haversineKm, type LatLng } from "./geo";
import type { City, Leg } from "./schema";

type Mode = Leg["mode"];

/**
 * Rough door-to-door figures for a first draft of a leg, from the
 * great-circle distance alone: an average speed per mode (ground modes
 * pay a detour factor over the straight line) plus fixed overhead
 * (boarding, airport transfers). A starting point the guest edits, not a
 * timetable.
 */
const MODE_PROFILE: Record<
  Mode,
  { kmh: number; detour: number; overheadMin: number }
> = {
  train: { kmh: 90, detour: 1.25, overheadMin: 0 },
  bus: { kmh: 65, detour: 1.3, overheadMin: 0 },
  car: { kmh: 80, detour: 1.3, overheadMin: 0 },
  ferry: { kmh: 30, detour: 1.15, overheadMin: 30 },
  flight: { kmh: 750, detour: 1.05, overheadMin: 45 },
};

/** Beyond this the default suggestion becomes a flight. */
const FLIGHT_FROM_KM = 800;

/** A sensible default mode for a straight-line distance. */
export function suggestLegMode(km: number): Mode {
  return km >= FLIGHT_FROM_KM ? "flight" : "train";
}

/** "~45m", "~2h 30m", "~11h": rounded to 5 min under 2h, 15 min above. */
export function estimateLegDuration(mode: Mode, km: number): string {
  const { kmh, detour, overheadMin } = MODE_PROFILE[mode];
  const minutes = (km * detour * 60) / kmh + overheadMin;
  const step = minutes < 120 ? 5 : 15;
  const rounded = Math.max(step, Math.round(minutes / step) * step);
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  if (hours === 0) return `~${rest}m`;
  return rest === 0 ? `~${hours}h` : `~${hours}h ${rest}m`;
}

/** A stop placed on the map (new stops start at 0,0 until searched). */
const isPlaced = (ll: LatLng) => ll[0] !== 0 || ll[1] !== 0;

/** Straight-line km between two placed stops; null if either isn't placed. */
export function legDistanceKm(from: City, to: City): number | null {
  if (!isPlaced(from.ll) || !isPlaced(to.ll)) return null;
  return haversineKm(from.ll, to.ll);
}

/** A drafted leg between two stops: suggested mode and its estimate. */
export function suggestLeg(from: City, to: City): Leg {
  const km = legDistanceKm(from, to);
  if (km === null) return { mode: "train", label: "", duration: "" };
  const mode = suggestLegMode(km);
  return { mode, label: "", duration: estimateLegDuration(mode, km) };
}
