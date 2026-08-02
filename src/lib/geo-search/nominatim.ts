import { countryCodeToFlag } from "./flag";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** Nominatim's own usage policy caps unauthenticated traffic at 1 req/sec. */
const MIN_REQUEST_INTERVAL_MS = 1000;

/** Below this, Nominatim mostly returns noise — skip the network call. */
const MIN_QUERY_LENGTH = 2;

export interface CitySearchResult {
  name: string;
  country: string;
  flag: string;
  ll: [number, number];
  /** Full Nominatim label — shown in the picker to disambiguate same-name cities. */
  displayName: string;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  hamlet?: string;
  country?: string;
  country_code?: string;
}

interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

/** Nominatim splits "city" across several address fields by settlement size. */
function settlementName(address: NominatimAddress | undefined): string | null {
  return (
    address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.hamlet ??
    null
  );
}

/** Maps raw Nominatim places into City-shaped candidates, dropping duplicates. */
export function mapNominatimResults(raw: NominatimPlace[]): CitySearchResult[] {
  const seen = new Set<string>();
  const results: CitySearchResult[] = [];

  for (const place of raw) {
    const name = settlementName(place.address);
    const country = place.address?.country;
    const countryCode = place.address?.country_code;
    const lat = Number(place.lat);
    const lon = Number(place.lon);

    if (!name || !country || !countryCode) continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const key = `${name}|${country}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      name,
      country,
      flag: countryCodeToFlag(countryCode),
      ll: [lat, lon],
      displayName: place.display_name,
    });
  }

  return results;
}

let lastRequestAt = 0;
let throttleChain = Promise.resolve();

/** Serializes calls so each waits its full 1 req/sec gap before proceeding. */
async function throttle(): Promise<void> {
  let resolveNext!: () => void;
  const previous = throttleChain;
  throttleChain = new Promise<void>((resolve) => {
    resolveNext = resolve;
  });
  await previous;
  const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
  resolveNext();
}

/**
 * Searches Nominatim for cities matching `query`. Pair with a debounced
 * caller (see `useDebouncedValue`) so keystrokes don't each fire a request
 * — this only enforces the network-level 1 req/sec floor.
 *
 * Browsers refuse to let `fetch` set a custom `User-Agent`; Nominatim's
 * usage policy accepts an identifying Referer instead, which the browser
 * attaches to every request automatically, so no header is set for it.
 */
export async function searchCities(
  query: string,
  options: { signal?: AbortSignal; limit?: number } = {},
): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  await throttle();

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(options.limit ?? 6));

  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      "accept-language":
        typeof navigator !== "undefined" ? navigator.language : "en",
    },
  });
  if (!response.ok) {
    throw new Error(`Nominatim search failed with status ${response.status}`);
  }

  const raw = (await response.json()) as NominatimPlace[];
  return mapNominatimResults(raw);
}
