import type { CitySearchResult } from "@/lib/geo-search";

export const makeCitySearchResult = (
  overrides: Partial<CitySearchResult> = {},
): CitySearchResult => ({
  name: "Ljubljana",
  country: "Slovenia",
  flag: "🇸🇮",
  ll: [46.0569, 14.5058],
  displayName: "Ljubljana, Slovenia",
  ...overrides,
});
