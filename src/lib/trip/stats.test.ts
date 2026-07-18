import { describe, expect, it } from "vitest";

import { makeCity, makeTrip } from "@/test/fixtures/trip";

import { SAMPLE_TRIP } from "./sample";
import { tripStats } from "./stats";

describe("tripStats", () => {
  it("sums nights and budget across stops", () => {
    const stats = tripStats(makeTrip(2));
    expect(stats.nights).toBe(6);
    expect(stats.cities).toBe(2);
    expect(stats.countries).toBe(1);
    expect(stats.budget).toEqual([540, 960]); // [90, 160] €/day × 3 nights × 2
  });

  it("reports zero distance for co-located stops", () => {
    expect(tripStats(makeTrip(2)).totalKm).toBe(0);
  });

  it("counts distinct countries and realistic distance on the sample trip", () => {
    const stats = tripStats(SAMPLE_TRIP);
    expect(stats.countries).toBe(3); // France, Switzerland, Italy
    expect(stats.nights).toBe(13);
    expect(stats.totalKm).toBeGreaterThan(1000);
    expect(stats.totalKm).toBeLessThan(1800);
    expect(stats.totalKm % 10).toBe(0);
  });

  it("scales budget by nights per city", () => {
    const trip = makeTrip(2, {
      cities: [
        makeCity({ nights: 1, budget: [100, 200] }),
        makeCity({ nights: 2, budget: [50, 60] }),
      ],
    });
    expect(tripStats(trip).budget).toEqual([200, 320]);
  });
});
