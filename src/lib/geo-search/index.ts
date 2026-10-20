/**
 * Geo-search domain — public API.
 *
 * City lookups behind a swappable provider; the editor's city search
 * imports only from here, never from `./photon` directly.
 */
export type { CitySearchResult, PhotonFeature } from "./schema";
export { searchCities } from "./photon";
