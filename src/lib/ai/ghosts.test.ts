import { describe, expect, it } from "vitest";

import { makeCity } from "@/test/fixtures/trip";

import { placeGhostStops } from "./ghosts";

const vienna = makeCity({ name: "Vienna", ll: [48.2, 16.37] });
const graz = makeCity({ name: "Graz", ll: [47.07, 15.44] });

describe("placeGhostStops", () => {
  it("returns nothing without cities or names", () => {
    expect(placeGhostStops([], ["Ljubljana"])).toEqual([]);
    expect(placeGhostStops([vienna, graz], [])).toEqual([]);
  });

  it("continues the final leg's heading past the last stop", () => {
    const [ghost] = placeGhostStops([vienna, graz], ["Ljubljana"]);

    expect(ghost.name).toBe("Ljubljana");
    // Vienna → Graz heads south-west, so the ghost lands further south-west.
    expect(ghost.ll[0]).toBeLessThan(graz.ll[0]);
    expect(ghost.ll[1]).toBeLessThan(graz.ll[1]);
  });

  it("fans several ghosts out at distinct positions, keeping their order", () => {
    const ghosts = placeGhostStops([vienna, graz], ["A", "B", "C"]);

    expect(ghosts.map((g) => g.name)).toEqual(["A", "B", "C"]);
    expect(new Set(ghosts.map((g) => g.ll.join(","))).size).toBe(3);
  });

  it("heads east from a single stop with a minimum reach", () => {
    const [ghost] = placeGhostStops([vienna], ["Bratislava"]);

    expect(ghost.ll[0]).toBeCloseTo(vienna.ll[0], 6);
    expect(ghost.ll[1]).toBeCloseTo(vienna.ll[1] + 0.6, 6);
  });
});
