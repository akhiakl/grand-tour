import { describe, expect, it } from "vitest";

import {
  clearPanOffset,
  fitPadding,
  isMapSized,
  isPointObscured,
} from "./fit-padding";

describe("fitPadding", () => {
  it("keeps a margin, wider where labels sit, when nothing covers the map", () => {
    expect(fitPadding()).toEqual({
      paddingTopLeft: [56, 56],
      paddingBottomRight: [120, 56],
    });
  });

  it("clears the mobile card along the bottom", () => {
    expect(fitPadding({ bottom: 180 }).paddingBottomRight).toEqual([120, 236]);
  });

  it("clears the desktop card along the left", () => {
    expect(fitPadding({ left: 400 }).paddingTopLeft).toEqual([456, 56]);
  });

  it("tightens vertical margins when the sheet leaves a strip of map", () => {
    expect(fitPadding({ bottom: 500 }, 870)).toEqual({
      paddingTopLeft: [56, 16],
      paddingBottomRight: [120, 516],
    });
  });

  it("ignores negative insets", () => {
    expect(fitPadding({ bottom: -20, left: -5 })).toEqual(fitPadding());
  });
});

describe("fitPadding with a collapsed card", () => {
  it("clears a top strip instead of the left column", () => {
    expect(fitPadding({ top: 140 })).toEqual({
      paddingTopLeft: [56, 196],
      paddingBottomRight: [120, 56],
    });
  });

  it("counts the top strip when deciding whether the map is roomy", () => {
    expect(fitPadding({ top: 300 }, 700).paddingTopLeft).toEqual([56, 316]);
  });
});

describe("clearPanOffset / isPointObscured", () => {
  const map = { x: 1440, y: 900 };

  it("leaves a point in the clear area alone", () => {
    const point = { x: 800, y: 400 };
    expect(clearPanOffset(point, { left: 440 }, map)).toEqual([0, 0]);
    expect(isPointObscured(point, { left: 440 }, map)).toBe(false);
  });

  it("pans a stop out from under the desktop card", () => {
    const point = { x: 200, y: 400 };
    expect(isPointObscured(point, { left: 440 }, map)).toBe(true);
    // Lands 24px clear of the card's right edge.
    expect(clearPanOffset(point, { left: 440 }, map)).toEqual([-264, 0]);
  });

  it("treats a stop hugging the card edge as covered", () => {
    expect(isPointObscured({ x: 450, y: 400 }, { left: 440 }, map)).toBe(true);
  });

  it("pans a stop up from under the mobile sheet", () => {
    const phone = { x: 390, y: 844 };
    const point = { x: 200, y: 700 };
    expect(clearPanOffset(point, { bottom: 300 }, phone)).toEqual([0, 180]);
  });

  it("pans a stop down from under the collapsed card", () => {
    expect(clearPanOffset({ x: 200, y: 80 }, { top: 140 }, map)).toEqual([0, -84]);
  });

  it("brings an off-screen stop back into view", () => {
    expect(clearPanOffset({ x: 1500, y: -10 }, {}, map)).toEqual([84, -34]);
  });

  it("ignores negative insets", () => {
    expect(isPointObscured({ x: 30, y: 30 }, { left: -100, top: -5 }, map)).toBe(
      false,
    );
  });
});

describe("isMapSized", () => {
  it("is false for a hidden (0×0) map", () => {
    expect(isMapSized({ x: 0, y: 0 })).toBe(false);
  });

  it("is false when either dimension collapses", () => {
    expect(isMapSized({ x: 800, y: 0 })).toBe(false);
    expect(isMapSized({ x: 0, y: 600 })).toBe(false);
  });

  it("is true for a laid-out map", () => {
    expect(isMapSized({ x: 800, y: 600 })).toBe(true);
  });
});
