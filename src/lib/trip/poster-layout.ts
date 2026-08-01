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
