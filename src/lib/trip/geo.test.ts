import { describe, expect, it } from "vitest";

import { makeCity } from "@/test/fixtures/trip";

import { legMidpoint, routeBounds } from "./geo";

describe("routeBounds", () => {
  it("returns the enclosing south-west and north-east corners", () => {
    const cities = [
      makeCity({ ll: [48.8566, 2.3522] }), // Paris
      makeCity({ ll: [41.9028, 12.4964] }), // Rome
      makeCity({ ll: [46.2044, 6.1432] }), // Geneva
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
