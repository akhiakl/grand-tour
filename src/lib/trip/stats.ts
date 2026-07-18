import { haversineKm } from "./geo";
import type { Trip } from "./schema";

export interface TripStats {
  nights: number;
  cities: number;
  countries: number;
  /** Great-circle route length, rounded to the nearest 10 km. */
  totalKm: number;
  /** Whole-trip per-person budget range (per-day range × nights, summed). */
  budget: [number, number];
}

/** Derived headline numbers for the stats strip, intro and share cards. */
export function tripStats(trip: Trip): TripStats {
  const nights = trip.cities.reduce((sum, city) => sum + city.nights, 0);
  const countries = new Set(trip.cities.map((city) => city.country)).size;

  const distance = trip.cities
    .slice(0, -1)
    .reduce((sum, city, i) => sum + haversineKm(city.ll, trip.cities[i + 1].ll), 0);

  const budget = trip.cities.reduce<[number, number]>(
    (acc, city) => [
      acc[0] + city.budget[0] * city.nights,
      acc[1] + city.budget[1] * city.nights,
    ],
    [0, 0],
  );

  return {
    nights,
    cities: trip.cities.length,
    countries,
    totalKm: Math.round(distance / 10) * 10,
    budget,
  };
}
