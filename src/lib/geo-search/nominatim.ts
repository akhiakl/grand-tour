import { countryCodeToFlag } from "./flag";
import {
  NominatimResultSchema,
  type CitySearchResult,
  type NominatimResult,
} from "./schema";

/**
 * Nominatim (OpenStreetMap) city search — one of potentially several
 * providers behind this domain's public API. Runs client-side, so it
 * relies on the browser's automatic Referer header to identify the app
 * (Nominatim's usage policy asks for an identifying User-Agent or Referer;
 * browsers forbid scripts from setting User-Agent themselves).
 */

const SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 8;
const MIN_REQUEST_INTERVAL_MS = 1000;

let lastRequestAt = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function throttle(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

function cityName(result: NominatimResult) {
  return (
    result.address?.city ??
    result.address?.town ??
    result.address?.village ??
    result.address?.municipality ??
    result.display_name.split(",")[0].trim()
  );
}

/**
 * Search for cities matching `query`. Self-throttled to at most one
 * outgoing request per second regardless of caller cadence; callers
 * should still debounce keystrokes (≥500ms) to avoid queueing requests.
 */
export async function searchCities(
  query: string,
  options: { signal?: AbortSignal } = {},
): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  await throttle();

  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(RESULT_LIMIT));

  const response = await fetch(url, {
    signal: options.signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`nominatim_error_${response.status}`);
  }

  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) return [];

  const results: CitySearchResult[] = [];
  for (const item of raw) {
    const parsed = NominatimResultSchema.safeParse(item);
    if (!parsed.success) continue;
    const { data } = parsed;
    results.push({
      name: cityName(data),
      country: data.address?.country ?? "",
      flag: countryCodeToFlag(data.address?.country_code),
      ll: [Number(data.lat), Number(data.lon)],
      displayName: data.display_name,
    });
  }
  return results;
}
