import type { LatLng } from "./geo";

export interface PosterPoint {
  x: number;
  y: number;
}

export interface PosterBox {
  width: number;
  height: number;
  padding: number;
}

/**
 * Builds a lat/lng → canvas projector for the poster's map area:
 * equirectangular with cos(midLat) correction, contain-fit and centered
 * inside the padded box so the route keeps its geographic proportions.
 */
export function makeProjector(
  stops: readonly LatLng[],
  box: PosterBox,
): (ll: LatLng) => PosterPoint {
  const innerW = box.width - box.padding * 2;
  const innerH = box.height - box.padding * 2;

  const lats = stops.map(([lat]) => lat);
  const lngs = stops.map(([, lng]) => lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const midLat = (minLat + maxLat) / 2;
  const lngScale = Math.cos((midLat * Math.PI) / 180);

  const spanX = (maxLng - minLng) * lngScale;
  const spanY = maxLat - minLat;

  // Degenerate route (single stop / identical points) → center everything.
  if (spanX === 0 && spanY === 0) {
    return () => ({ x: box.width / 2, y: box.height / 2 });
  }

  const scale = Math.min(
    innerW / (spanX || Number.EPSILON),
    innerH / (spanY || Number.EPSILON),
  );

  const offsetX = box.padding + (innerW - spanX * scale) / 2;
  const offsetY = box.padding + (innerH - spanY * scale) / 2;

  return ([lat, lng]) => ({
    x: offsetX + (lng - minLng) * lngScale * scale,
    // Canvas y grows downward; latitude grows upward.
    y: offsetY + (maxLat - lat) * scale,
  });
}

/**
 * Which side of a stop its label should sit on, pushing away from the
 * cluster's center so close stops don't overlap their names.
 */
export function labelSide(
  point: PosterPoint,
  all: readonly PosterPoint[],
): "above" | "below" {
  const centroidY = all.reduce((sum, p) => sum + p.y, 0) / all.length;
  return point.y <= centroidY ? "above" : "below";
}

/* ——— Web-Mercator view (route + slippy-map tiles share one projection) ——— */

const TILE_SIZE = 256;

/** Normalized Web-Mercator x (0..1) for a longitude. */
export function lngToMercX(lng: number): number {
  return (lng + 180) / 360;
}

/** Normalized Web-Mercator y (0..1, north at 0) for a latitude. */
export function latToMercY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2;
  return Math.min(1, Math.max(0, y));
}

export interface MercatorView {
  /** lat/lng → point in box coordinates. */
  project: (ll: LatLng) => PosterPoint;
  /** Canvas pixels covered by the full mercator world (0..1 span). */
  worldPx: number;
  /** Box-space position of the mercator origin (may be far off-box). */
  originPx: PosterPoint;
}

/**
 * Contain-fits the stops in Web-Mercator space so route geometry and
 * standard map tiles can be drawn with the same transform.
 */
export function makeMercatorView(
  stops: readonly LatLng[],
  box: PosterBox,
): MercatorView {
  const innerW = box.width - box.padding * 2;
  const innerH = box.height - box.padding * 2;

  const xs = stops.map(([, lng]) => lngToMercX(lng));
  const ys = stops.map(([lat]) => latToMercY(lat));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX;
  const spanY = maxY - minY;

  const worldPx =
    spanX === 0 && spanY === 0
      ? TILE_SIZE * 2 ** 6 // single stop: a pleasant regional zoom
      : Math.min(
          innerW / (spanX || Number.EPSILON),
          innerH / (spanY || Number.EPSILON),
        );

  const offsetX = box.padding + (innerW - spanX * worldPx) / 2;
  const offsetY = box.padding + (innerH - spanY * worldPx) / 2;
  const originPx = { x: offsetX - minX * worldPx, y: offsetY - minY * worldPx };

  return {
    project: ([lat, lng]) => ({
      x: originPx.x + lngToMercX(lng) * worldPx,
      y: originPx.y + latToMercY(lat) * worldPx,
    }),
    worldPx,
    originPx,
  };
}

/** Slippy-map zoom whose tiles render at ≤ native size for this view. */
export function pickTileZoom(worldPx: number, maxZoom = 8): number {
  return Math.min(maxZoom, Math.max(2, Math.ceil(Math.log2(worldPx / TILE_SIZE))));
}

export interface TilePlacement {
  x: number;
  y: number;
  px: number;
  py: number;
  size: number;
}

/** Tiles at zoom `z` intersecting a window given in box coordinates. */
export function tilesInView(
  view: MercatorView,
  window: { x: number; y: number; width: number; height: number },
  z: number,
): TilePlacement[] {
  const count = 2 ** z;
  const size = view.worldPx / count;

  const firstIndex = (edge: number, origin: number) =>
    Math.max(0, Math.floor((edge - origin) / size));
  const lastIndex = (edge: number, origin: number) =>
    Math.min(count - 1, Math.floor((edge - origin) / size));

  const tiles: TilePlacement[] = [];
  const yStart = firstIndex(window.y, view.originPx.y);
  const yEnd = lastIndex(window.y + window.height, view.originPx.y);
  const xStart = firstIndex(window.x, view.originPx.x);
  const xEnd = lastIndex(window.x + window.width, view.originPx.x);

  for (let ty = yStart; ty <= yEnd; ty += 1) {
    for (let tx = xStart; tx <= xEnd; tx += 1) {
      tiles.push({
        x: tx,
        y: ty,
        px: view.originPx.x + tx * size,
        py: view.originPx.y + ty * size,
        size,
      });
    }
  }
  return tiles;
}
