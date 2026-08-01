/**
 * Geo-search domain — public API.
 *
 * Wraps the city-search provider (Nominatim today) behind `searchCities` so
 * the provider can be swapped without touching callers.
 */
export * from "./flag";
export * from "./nominatim";
