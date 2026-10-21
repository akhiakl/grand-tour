import { describe, expect, it } from "vitest";

import { makeCity } from "@/test/fixtures/trip";

import { sketchRoute } from ".";

const BOX = { width: 400, height: 300, padding: 40 };

describe("sketchRoute", () => {
  it("places every stop inside the padded box", () => {
    const cities = [
      makeCity({ name: "Paris", ll: [48.86, 2.35] }),
      makeCity({ name: "Geneva", ll: [46.2, 6.14] }),
      makeCity({ name: "Rome", ll: [41.9, 12.5] }),
    ];
    const { stops } = sketchRoute(cities, BOX);

    expect(stops.map((s) => s.name)).toEqual(["Paris", "Geneva", "Rome"]);
    for (const { x, y } of stops) {
      expect(x).toBeGreaterThanOrEqual(BOX.padding);
      expect(x).toBeLessThanOrEqual(BOX.width - BOX.padding);
      expect(y).toBeGreaterThanOrEqual(BOX.padding);
      expect(y).toBeLessThanOrEqual(BOX.height - BOX.padding);
    }
  });

  it("keeps north up", () => {
    const { stops } = sketchRoute(
      [makeCity({ ll: [52, 4] }), makeCity({ ll: [40, 4.5] })],
      BOX,
    );
    expect(stops[0].y).toBeLessThan(stops[1].y);
  });

  it("draws a curve that starts and ends on the first and last stops", () => {
    const { path, stops } = sketchRoute(
      [makeCity({ ll: [48, 2] }), makeCity({ ll: [45, 9] })],
      BOX,
    );
    const first = stops[0];
    const last = stops[1];
    expect(path.startsWith(`M${first.x} ${first.y} L`)).toBe(true);
    expect(path.endsWith(`L${last.x} ${last.y}`)).toBe(true);
  });

  it("draws no path for a single stop and nothing for none", () => {
    expect(sketchRoute([makeCity()], BOX).path).toBe("");
    expect(sketchRoute([], BOX)).toEqual({ path: "", stops: [] });
  });
});
