/** OpenFreeMap: open-source, keyless vector tiles built from OpenStreetMap. */
export const DEFAULT_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const OSM_CREDIT =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
const OPENFREEMAP_CREDIT =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> ';

export interface MapStyle {
  url: string;
  /** HTML credit for the live map's attribution control. */
  attribution: string;
  /** Plain-text credit for canvas renders (poster). */
  attributionText: string;
}

/**
 * The public OpenFreeMap style unless `NEXT_PUBLIC_MAP_STYLE_URL` points
 * at a self-hosted one (OpenFreeMap, Protomaps, ...). Custom styles keep
 * the OpenStreetMap credit every OSM-based basemap requires.
 */
export function resolveMapStyle(customUrl: string | undefined): MapStyle {
  const url = customUrl?.trim();
  if (url) {
    return {
      url,
      attribution: OSM_CREDIT,
      attributionText: "© OpenStreetMap contributors",
    };
  }
  return {
    url: DEFAULT_MAP_STYLE_URL,
    attribution: OPENFREEMAP_CREDIT + OSM_CREDIT,
    attributionText: "OpenFreeMap © OpenMapTiles © OpenStreetMap contributors",
  };
}

// Referenced literally so Next.js inlines it into the client bundle.
export const MAP_STYLE = resolveMapStyle(process.env.NEXT_PUBLIC_MAP_STYLE_URL);

/**
 * Raster Positron tiles for browsers where MapLibre can't start (no WebGL2,
 * e.g. Safari with Lockdown Mode or an exhausted GPU context).
 * shortcut: CARTO's free basemap terms, not cached offline by the service
 * worker; self-host raster tiles or buy a plan if traffic grows.
 */
export const RASTER_FALLBACK = {
  url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  subdomains: "abcd",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
} as const;
