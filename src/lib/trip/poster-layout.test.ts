import { describe, expect, it } from "vitest";

import {
  labelSide,
  latToMercY,
  lngToMercX,
  makeMercatorView,
  makeProjector,
  pickTileZoom,
  tilesInView,
  type PosterPoint,
} from "./poster-layout";

const BOX = { width: 1000, height: 800, padding: 100 };

describe("makeProjector", () => {
  const stops: [number, number][] = [
    [48, 2], // north-west
    [42, 12], // south-east
  ];
  const project = makeProjector(stops, BOX);

  it("maps north to smaller y and east to larger x", () => {
    const nw = project([48, 2]);
    const se = project([42, 12]);
    expect(nw.y).toBeLessThan(se.y);
    expect(nw.x).toBeLessThan(se.x);
  });

  it("keeps every stop inside the padded box", () => {
    for (const stop of stops) {
      const { x, y } = project(stop);
      expect(x).toBeGreaterThanOrEqual(BOX.padding);
      expect(x).toBeLessThanOrEqual(BOX.width - BOX.padding);
      expect(y).toBeGreaterThanOrEqual(BOX.padding);
      expect(y).toBeLessThanOrEqual(BOX.height - BOX.padding);
    }
  });

  it("centers the shorter axis", () => {
    const nw = project([48, 2]);
    const se = project([42, 12]);
    const centerX = (nw.x + se.x) / 2;
    const centerY = (nw.y + se.y) / 2;
    // Contain-fit: at least one axis is centered exactly; both stay near
    // the middle of the box.
    expect(Math.abs(centerX - BOX.width / 2)).toBeLessThan(1);
    expect(Math.abs(centerY - BOX.height / 2)).toBeLessThan(1);
  });

  it("preserves geographic aspect (no stretching)", () => {
    const a = project([48, 2]);
    const b = project([48, 12]);
    const c = project([42, 2]);
    const width = b.x - a.x;
    const height = c.y - a.y;
    const midLat = 45;
    const expectedRatio = (10 * Math.cos((midLat * Math.PI) / 180)) / 6; // Δlng·cos / Δlat
    expect(width / height).toBeCloseTo(expectedRatio, 5);
  });

  it("centers a degenerate single-point route", () => {
    const projectOne = makeProjector([[45, 10]], BOX);
    expect(projectOne([45, 10])).toEqual({ x: 500, y: 400 });
  });
});

describe("labelSide", () => {
  const points: PosterPoint[] = [
    { x: 0, y: 100 },
    { x: 0, y: 300 },
  ];

  it("labels stops above the centroid on top, below otherwise", () => {
    expect(labelSide(points[0], points)).toBe("above");
    expect(labelSide(points[1], points)).toBe("below");
  });
});

describe("mercator helpers", () => {
  it("maps the equator/prime-meridian to the world center", () => {
    expect(lngToMercX(0)).toBe(0.5);
    expect(latToMercY(0)).toBeCloseTo(0.5, 10);
  });

  it("maps north to smaller y", () => {
    expect(latToMercY(60)).toBeLessThan(latToMercY(0));
  });
});

describe("makeMercatorView", () => {
  const stops: [number, number][] = [
    [48.86, 2.35],
    [41.9, 12.5],
  ];
  const view = makeMercatorView(stops, BOX);

  it("keeps every stop inside the padded box", () => {
    for (const stop of stops) {
      const { x, y } = view.project(stop);
      expect(x).toBeGreaterThanOrEqual(BOX.padding - 1e-6);
      expect(x).toBeLessThanOrEqual(BOX.width - BOX.padding + 1e-6);
      expect(y).toBeGreaterThanOrEqual(BOX.padding - 1e-6);
      expect(y).toBeLessThanOrEqual(BOX.height - BOX.padding + 1e-6);
    }
  });

  it("keeps north up", () => {
    expect(view.project(stops[0]).y).toBeLessThan(view.project(stops[1]).y);
  });

  it("projects consistently with worldPx and originPx", () => {
    const p = view.project(stops[0]);
    expect(p.x).toBeCloseTo(view.originPx.x + lngToMercX(2.35) * view.worldPx, 6);
    expect(p.y).toBeCloseTo(view.originPx.y + latToMercY(48.86) * view.worldPx, 6);
  });
});

describe("pickTileZoom", () => {
  it("picks the zoom whose native tiles are not upscaled", () => {
    expect(pickTileZoom(256 * 2 ** 7)).toBe(7);
    expect(pickTileZoom(256 * 2 ** 7 + 1)).toBe(8);
  });

  it("clamps to the allowed range", () => {
    expect(pickTileZoom(1)).toBe(2);
    expect(pickTileZoom(256 * 2 ** 15)).toBe(8);
    expect(pickTileZoom(256 * 2 ** 15, 10)).toBe(10);
  });
});

describe("tilesInView", () => {
  const stops: [number, number][] = [
    [48.86, 2.35],
    [41.9, 12.5],
  ];
  const view = makeMercatorView(stops, BOX);
  const z = pickTileZoom(view.worldPx);
  const tiles = tilesInView(
    view,
    { x: 0, y: 0, width: BOX.width, height: BOX.height },
    z,
  );

  it("covers the window with adjacent tiles", () => {
    expect(tiles.length).toBeGreaterThan(0);
    const size = view.worldPx / 2 ** z;
    for (const tile of tiles) {
      expect(tile.size).toBeCloseTo(size, 6);
      expect(tile.px).toBeCloseTo(view.originPx.x + tile.x * size, 6);
      expect(tile.py).toBeCloseTo(view.originPx.y + tile.y * size, 6);
    }
    // Every tile intersects the window.
    for (const tile of tiles) {
      expect(tile.px + tile.size).toBeGreaterThan(0);
      expect(tile.px).toBeLessThan(BOX.width);
      expect(tile.py + tile.size).toBeGreaterThan(0);
      expect(tile.py).toBeLessThan(BOX.height);
    }
  });

  it("clamps indices to the tile grid", () => {
    for (const tile of tiles) {
      expect(tile.x).toBeGreaterThanOrEqual(0);
      expect(tile.x).toBeLessThan(2 ** z);
      expect(tile.y).toBeGreaterThanOrEqual(0);
      expect(tile.y).toBeLessThan(2 ** z);
    }
  });
});
