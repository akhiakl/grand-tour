import { describe, expect, it } from "vitest";

import { makeCity } from "@/test/fixtures/trip";

import { arcPoints, haversineKm, legMidpoint, routeBounds, routePath } from "./geo";

const PARIS: [number, number] = [48.8566, 2.3522];
const GENEVA: [number, number] = [46.2044, 6.1432];

describe("routeBounds", () => {
  it("returns the enclosing south-west and north-east corners", () => {
    const cities = [
      makeCity({ ll: PARIS }),
      makeCity({ ll: [41.9028, 12.4964] }), // Rome
      makeCity({ ll: GENEVA }),
    ];
    expect(routeBounds(cities)).toEqual([
      [41.9028, 2.3522],
      [48.8566, 12.4964],
    ]);
  });

  it("collapses to a point for a single city", () => {
    const city = makeCity({ ll: [48.2082, 16.3738] });
    expect(routeBounds([city])).toEqual([
      [48.2082, 16.3738],
      [48.2082, 16.3738],
    ]);
  });
});

describe("legMidpoint", () => {
  it("averages both coordinates", () => {
    expect(legMidpoint([40, 10], [50, 20])).toEqual([45, 15]);
  });

  it("handles negative longitudes across the prime meridian", () => {
    expect(legMidpoint([51.5, -0.12], [48.85, 2.35])).toEqual([50.175, 1.115]);
  });
});

describe("haversineKm", () => {
  it("matches the known Paris–Geneva great-circle distance", () => {
    const distance = haversineKm(PARIS, GENEVA);
    expect(distance).toBeGreaterThan(390);
    expect(distance).toBeLessThan(420);
  });

  it("is zero for identical points", () => {
    expect(haversineKm(PARIS, PARIS)).toBe(0);
  });
});

describe("arcPoints", () => {
  it("starts and ends exactly at the stops", () => {
    const arc = arcPoints(PARIS, GENEVA);
    expect(arc[0]).toEqual(PARIS);
    expect(arc.at(-1)).toEqual(GENEVA);
    expect(arc).toHaveLength(21);
  });

  it("bows away from the straight midpoint", () => {
    const arc = arcPoints(PARIS, GENEVA, 2);
    const straight = legMidpoint(PARIS, GENEVA);
    expect(arc[1]).not.toEqual(straight);
  });
});

describe("routePath", () => {
  it("chains arcs without duplicating joints", () => {
    const stops: [number, number][] = [PARIS, GENEVA, [45.44, 12.32]];
    const path = routePath(stops, 20);
    expect(path).toHaveLength(2 * 20 + 1);
    expect(path[0]).toEqual(PARIS);
    expect(path.at(-1)).toEqual([45.44, 12.32]);
  });
});
