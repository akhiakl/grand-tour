import { countryCodeToFlag } from "./flag";
import {
  PhotonFeatureSchema,
  type CitySearchResult,
  type PhotonFeature,
} from "./schema";

/**
 * Photon (komoot, Apache-2.0, OpenStreetMap data) city search. Unlike
 * public Nominatim, Photon is built for search-as-you-type; callers still
 * debounce keystrokes and abort stale requests to stay within fair use.
 */

const SEARCH_URL = "https://photon.komoot.io/api/";
const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 8;
/** Settlement layers only: no streets, POIs or countries. */
const LAYERS = ["city", "locality"];

function toResult({ geometry, properties }: PhotonFeature): CitySearchResult {
  const [lng, lat] = geometry.coordinates;
  const country = properties.country ?? "";
  return {
    name: properties.name,
    country,
    flag: countryCodeToFlag(properties.countrycode),
    ll: [lat, lng],
    displayName: [properties.name, properties.state, country]
      .filter(Boolean)
      .join(", "),
  };
}

/** Search for cities matching `query`. */
export async function searchCities(
  query: string,
  options: { signal?: AbortSignal } = {},
): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", String(RESULT_LIMIT));
  for (const layer of LAYERS) url.searchParams.append("layer", layer);

  const response = await fetch(url, {
    signal: options.signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`photon_error_${response.status}`);
  }

  const raw = (await response.json()) as { features?: unknown };
  if (!Array.isArray(raw.features)) return [];

  const results: CitySearchResult[] = [];
  for (const item of raw.features) {
    const parsed = PhotonFeatureSchema.safeParse(item);
    if (parsed.success) results.push(toResult(parsed.data));
  }
  return results;
}
