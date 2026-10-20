import { describe, expect, it } from "vitest";

import { declutter, mirrorX, overlaps, type Box } from "./declutter";

const box = (left: number, top: number, width = 40, height = 20): Box => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
});

describe("overlaps", () => {
  it("treats a small gap as touching", () => {
    expect(overlaps(box(0, 0), box(41, 0))).toBe(true);
    expect(overlaps(box(0, 0), box(50, 0))).toBe(false);
  });
});

describe("mirrorX", () => {
  it("flips a box to the other side of x", () => {
    expect(mirrorX(box(110, 0, 40), 100)).toEqual({
      left: 50,
      top: 0,
      right: 90,
      bottom: 20,
    });
  });
});

describe("declutter", () => {
  it("keeps the first option when it's free", () => {
    const { placement } = declutter({
      labels: [{ id: "a", options: [box(0, 0), box(-60, 0)] }],
      badges: [],
      obstacles: [],
    });
    expect(placement.get("a")).toBe(0);
  });

  it("flips a label that would collide, and hides one with no room", () => {
    const { placement } = declutter({
      labels: [
        { id: "a", options: [box(0, 0)] },
        { id: "b", options: [box(10, 5), box(100, 5)] },
        { id: "c", options: [box(5, 10), box(95, 10)] },
      ],
      badges: [],
      obstacles: [],
    });
    expect(placement.get("b")).toBe(1);
    expect(placement.get("c")).toBeNull();
  });

  it("flips a label that would run off the edge of the map", () => {
    const { placement } = declutter({
      labels: [{ id: "a", options: [box(380, 0), box(300, 0)] }],
      badges: [],
      obstacles: [],
      viewport: box(0, 0, 400, 800),
    });
    expect(placement.get("a")).toBe(1);
  });

  it("never hides a kept label", () => {
    const { placement } = declutter({
      labels: [{ id: "a", options: [box(0, 0)], keep: true }],
      badges: [],
      obstacles: [box(0, 0)],
    });
    expect(placement.get("a")).toBe(0);
  });

  it("hides badges on labels, dots and other badges", () => {
    const { hiddenBadges } = declutter({
      labels: [{ id: "a", options: [box(0, 0)] }],
      badges: [
        { id: "on-label", box: box(20, 5, 20, 14) },
        { id: "on-dot", box: box(200, 200, 20, 14) },
        { id: "clear", box: box(400, 0, 20, 14) },
        { id: "on-badge", box: box(405, 2, 20, 14) },
      ],
      obstacles: [box(205, 205, 10, 10)],
    });
    expect([...hiddenBadges].sort()).toEqual(["on-badge", "on-dot", "on-label"]);
  });
});
