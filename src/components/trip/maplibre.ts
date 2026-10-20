import * as maplibregl from "maplibre-gl";

// MapLibre 6 resolves its worker from a runtime-computed URL that bundlers
// cannot see; point it at the emitted asset explicitly.
maplibregl.setWorkerUrl(
  new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href,
);

export { maplibregl };
