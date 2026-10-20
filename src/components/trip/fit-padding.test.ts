import { describe, expect, it } from "vitest";

import { fitPadding } from "./fit-padding";

describe("fitPadding", () => {
  it("keeps a margin, wider where labels sit, when nothing covers the map", () => {
    expect(fitPadding()).toEqual({
      paddingTopLeft: [56, 56],
      paddingBottomRight: [120, 56],
    });
  });

  it("clears the mobile sheet along the bottom", () => {
    expect(fitPadding(180).paddingBottomRight).toEqual([120, 236]);
  });

  it("tightens vertical margins when the sheet leaves a strip of map", () => {
    expect(fitPadding(500, 870)).toEqual({
      paddingTopLeft: [56, 16],
      paddingBottomRight: [120, 516],
    });
  });

  it("ignores a negative inset", () => {
    expect(fitPadding(-20).paddingBottomRight).toEqual([120, 56]);
  });
});
