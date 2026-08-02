/**
 * Geo-search domain — public API.
 *
 * City lookups behind a swappable provider; the editor's city search
 * imports only from here, never from `./nominatim` directly.
 */
export type { CitySearchResult } from "./schema";
export { searchCities } from "./nominatim";
