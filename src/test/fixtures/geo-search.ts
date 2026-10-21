import type { CitySearchResult, PhotonFeature } from "@/lib/geo-search";

/** Builders for geo-search provider payloads shared across unit tests. */

export const makePhotonFeature = (
  properties: Partial<PhotonFeature["properties"]> = {},
  coordinates: [number, number] = [16.3738, 48.2082],
): PhotonFeature => ({
  geometry: { coordinates },
  properties: {
    name: "Vienna",
    country: "Austria",
    countrycode: "AT",
    state: "Vienna",
    ...properties,
  },
});

export const makePhotonResponse = (features: unknown[] = [makePhotonFeature()]) => ({
  type: "FeatureCollection",
  features,
});

export const makeCitySearchResult = (
  overrides: Partial<CitySearchResult> = {},
): CitySearchResult => ({
  name: "Kyoto",
  country: "Japan",
  flag: "🇯🇵",
  ll: [35.0116, 135.7681],
  displayName: "Kyoto, Japan",
  ...overrides,
});
