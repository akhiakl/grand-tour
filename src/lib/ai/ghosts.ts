import type { City, LatLng } from "@/lib/trip";

/** A locked, approximate stop the AI suggested beyond the guest limit. */
export interface GhostStop {
  name: string;
  ll: LatLng;
}

const FAN_STEP_RAD = (55 * Math.PI) / 180;
/** Each later ghost sits a little further out so labels don't collide. */
const STAGGER = 0.35;
const MIN_REACH_DEG = 0.6;

/**
 * Places `names` as a fan just past the route's last stop, continuing its
 * final heading. Positions are deliberately approximate (no geocoding):
 * ghosts only hint that the route could go on, and open the upsell.
 */
export function placeGhostStops(
  cities: readonly City[],
  names: readonly string[],
): GhostStop[] {
  if (cities.length === 0 || names.length === 0) return [];

  const last = cities.at(-1)!.ll;
  const prev = cities.length > 1 ? cities.at(-2)!.ll : null;
  const dLat = prev ? last[0] - prev[0] : 0;
  const dLng = prev ? last[1] - prev[1] : 1;
  const heading = Math.atan2(dLat, dLng);
  const legLength = prev ? Math.hypot(dLat, dLng) : 0;
  const reach = Math.max(MIN_REACH_DEG, legLength * 0.8);

  return names.map((name, i) => {
    const angle = heading + (i - (names.length - 1) / 2) * FAN_STEP_RAD;
    const r = reach * (1 + i * STAGGER);
    return {
      name,
      ll: [last[0] + Math.sin(angle) * r, last[1] + Math.cos(angle) * r],
    };
  });
}
