import type { City } from "./schema";

export type LatLng = [number, number];

const EARTH_RADIUS_KM = 6371;

/** South-west / north-east corners enclosing every city on the route. */
export function routeBounds(cities: City[]): [LatLng, LatLng] {
  const lats = cities.map((city) => city.ll[0]);
  const lngs = cities.map((city) => city.ll[1]);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

/** Midpoint of a leg — where its transport badge sits on the map. */
export function legMidpoint(from: LatLng, to: LatLng): LatLng {
  return [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
}

/** Great-circle distance between two points. */
export function haversineKm(from: LatLng, to: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to[0] - from[0]);
  const dLng = toRad(to[1] - from[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from[0])) * Math.cos(toRad(to[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Gentle quadratic-bezier arc between two stops, sampled as points. */
export function arcPoints(from: LatLng, to: LatLng, segments = 20): LatLng[] {
  const cx = (from[0] + to[0]) / 2 + (to[1] - from[1]) * 0.12;
  const cy = (from[1] + to[1]) / 2 - (to[0] - from[0]) * 0.12;
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments;
    const u = 1 - t;
    return [
      u * u * from[0] + 2 * u * t * cx + t * t * to[0],
      u * u * from[1] + 2 * u * t * cy + t * t * to[1],
    ] as LatLng;
  });
}

/** The full curved route through every stop, joints deduplicated. */
export function routePath(stops: LatLng[], segments = 20): LatLng[] {
  return stops.slice(0, -1).flatMap((from, i) => {
    const arc = arcPoints(from, stops[i + 1], segments);
    return i === 0 ? arc : arc.slice(1);
  });
}
