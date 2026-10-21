import { blankCity } from "./draft";
import type { LatLng } from "./geo";
import { CitySchema, type City } from "./schema";

/** What a destination search knows about the city a route starts from. */
export interface StartCity {
  name: string;
  country: string;
  flag: string;
  ll: LatLng;
}

/**
 * Query string that opens the editor with `city` as stop 1, e.g.
 * `/new?${startCityQuery(city)}`. Plain parameters rather than storage, so
 * the link works in a new tab and can be shared.
 */
export function startCityQuery(city: StartCity): string {
  return new URLSearchParams({
    city: city.name,
    country: city.country,
    flag: city.flag,
    lat: String(city.ll[0]),
    lng: String(city.ll[1]),
  }).toString();
}

const inRange = (value: number, limit: number) =>
  Number.isFinite(value) && Math.abs(value) <= limit;

/** The start city a query string describes, or null if it isn't a valid one. */
export function startCityFromParams(params: URLSearchParams): City | null {
  const name = params.get("city");
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!name || !params.has("lat") || !params.has("lng")) return null;
  if (!inRange(lat, 90) || !inRange(lng, 180)) return null;

  const parsed = CitySchema.safeParse({
    ...blankCity(),
    name,
    country: params.get("country") ?? "",
    flag: params.get("flag") ?? "",
    ll: [lat, lng],
  });
  return parsed.success ? parsed.data : null;
}
