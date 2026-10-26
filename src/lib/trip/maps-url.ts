import type { Trip } from "./schema";

const MAX_WAYPOINTS = 9;

/**
 * A Google Maps directions link through every stop in order. A universal
 * link: opens the Maps app on phones, maps.google.com elsewhere.
 * shortcut: Google Maps only, stops past 11 are dropped, revisit if the city cap rises.
 */
export function tripMapsUrl(trip: Trip): string {
  const at = (c: Trip["cities"][number]) => `${c.ll[0]},${c.ll[1]}`;
  const { cities } = trip;
  const params = new URLSearchParams({
    api: "1",
    origin: at(cities[0]),
    destination: at(cities[cities.length - 1]),
  });
  const via = cities.slice(1, -1).slice(0, MAX_WAYPOINTS);
  if (via.length) params.set("waypoints", via.map(at).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}
