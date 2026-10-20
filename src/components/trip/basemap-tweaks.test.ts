import { describe, expect, it, vi } from "vitest";

import { basemapTweaks, LABEL_OPACITY, quietBasemap } from "./basemap-tweaks";

const LAYERS = [
  { id: "background", type: "background" },
  { id: "water", type: "fill" },
  { id: "poi_r1", type: "symbol" },
  { id: "highway_name_other", type: "symbol" },
  { id: "place_village", type: "symbol" },
  { id: "place_city", type: "symbol" },
  { id: "place_country_major", type: "symbol" },
];

describe("basemapTweaks", () => {
  it("hides noisy symbol layers and dims the rest, leaving non-symbols alone", () => {
    expect(basemapTweaks(LAYERS)).toEqual({
      hide: ["poi_r1", "highway_name_other", "place_village"],
      dim: ["place_city", "place_country_major"],
    });
  });
});

describe("quietBasemap", () => {
  it("applies the tweaks to the loaded style", () => {
    const basemap = {
      getStyle: () => ({ layers: LAYERS }),
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
    };
    quietBasemap(basemap);

    expect(basemap.setLayoutProperty).toHaveBeenCalledWith(
      "poi_r1",
      "visibility",
      "none",
    );
    expect(basemap.setLayoutProperty).toHaveBeenCalledTimes(3);
    expect(basemap.setPaintProperty).toHaveBeenCalledWith(
      "place_city",
      "text-opacity",
      LABEL_OPACITY,
    );
  });

  it("tolerates a style without layers", () => {
    const basemap = {
      getStyle: () => undefined,
      setLayoutProperty: vi.fn(),
      setPaintProperty: vi.fn(),
    };
    expect(() => quietBasemap(basemap)).not.toThrow();
  });
});
