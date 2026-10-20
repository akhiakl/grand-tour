/** The slice of a MapLibre map the tweaks need (kept narrow for tests). */
export interface TweakableBasemap {
  getStyle(): { layers?: { id: string; type: string }[] } | undefined;
  setLayoutProperty(layer: string, name: string, value: unknown): void;
  setPaintProperty(layer: string, name: string, value: unknown): void;
}

/** Symbol layers that only add noise under a route map. */
const NOISE =
  /poi|housenum|highway|road|street|transport|aeroway|airport|aerialway|rail|ferry|building|place_(village|hamlet|suburb|neighbou?rhood|quarter|locality|isolated|other)/i;

/** Remaining labels (countries, cities, water) recede behind the route. */
export const LABEL_OPACITY = 0.55;

export function basemapTweaks(layers: readonly { id: string; type: string }[]) {
  const symbols = layers.filter((layer) => layer.type === "symbol");
  return {
    hide: symbols.filter((layer) => NOISE.test(layer.id)).map((layer) => layer.id),
    dim: symbols.filter((layer) => !NOISE.test(layer.id)).map((layer) => layer.id),
  };
}

/**
 * Quiets whichever vector style is loaded: hides POI/road/minor-place
 * labels and fades the rest, so the brass route and stop labels lead.
 * Matches on common OpenMapTiles layer ids; unknown styles just get faded.
 */
export function quietBasemap(basemap: TweakableBasemap): void {
  const { hide, dim } = basemapTweaks(basemap.getStyle()?.layers ?? []);
  for (const id of hide) basemap.setLayoutProperty(id, "visibility", "none");
  for (const id of dim) {
    basemap.setPaintProperty(id, "text-opacity", LABEL_OPACITY);
    basemap.setPaintProperty(id, "icon-opacity", LABEL_OPACITY);
  }
}
