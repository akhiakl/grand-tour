import type { City } from "./schema";

export type LatLng = [number, number];

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
