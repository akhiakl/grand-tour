import { describe, expect, it } from "vitest";

import { fitPadding } from "./fit-padding";

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
