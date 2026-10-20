import { describe, expect, it } from "vitest";

import { DEFAULT_MAP_STYLE_URL, resolveMapStyle } from "./map-style";

describe("resolveMapStyle", () => {
  it.each([undefined, "", "   "])("uses public OpenFreeMap for %j", (value) => {
    const style = resolveMapStyle(value);
    expect(style.url).toBe(DEFAULT_MAP_STYLE_URL);
    expect(style.attribution).toContain("OpenFreeMap");
    expect(style.attributionText).toContain("OpenFreeMap");
  });

  it("uses a custom style URL with the OpenStreetMap credit only", () => {
    const style = resolveMapStyle(" https://maps.example.com/style.json ");
    expect(style.url).toBe("https://maps.example.com/style.json");
    expect(style.attribution).toContain("OpenStreetMap");
    expect(style.attribution).not.toContain("OpenFreeMap");
    expect(style.attributionText).toBe("© OpenStreetMap contributors");
  });
});
