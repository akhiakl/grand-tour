import { describe, expect, it } from "vitest";

import { fitPadding } from "./fit-padding";

describe("fitPadding", () => {
  it("keeps a plain margin for embedded maps", () => {
    expect(fitPadding(1280, false)).toEqual({
      paddingTopLeft: [72, 72],
      paddingBottomRight: [72, 72],
    });
  });

  it("clears the stats strip on the left from md up", () => {
    expect(fitPadding(768, true).paddingTopLeft[0]).toBeGreaterThan(200);
    expect(fitPadding(767, true).paddingTopLeft[0]).toBeLessThan(100);
  });

  it("always clears the bottom rail and CTA row", () => {
    expect(fitPadding(360, true).paddingBottomRight[1]).toBeGreaterThanOrEqual(230);
    expect(fitPadding(1280, true).paddingBottomRight[1]).toBeGreaterThanOrEqual(230);
  });
});
