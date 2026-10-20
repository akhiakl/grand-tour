import { mercatorCamera, type MercatorView } from "@/lib/trip";

import { MAP_STYLE } from "./map-style";

export interface TileWindow {
  x: number;
  y: number;
  width: number;
  height: number;
}

const RENDER_TIMEOUT_MS = 10_000;

/**
 * Renders the OpenFreeMap style offscreen at the poster window's size and
 * resolves to its canvas once every tile has drawn, or null on timeout or
 * load failure (offline etc.).
 */
async function renderBasemap(
  view: MercatorView,
  window: TileWindow,
): Promise<HTMLCanvasElement | null> {
  const { maplibregl } = await import("./maplibre");
  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:-99999px;top:0;width:${window.width}px;height:${window.height}px;`;
  document.body.appendChild(container);

  const { center, zoom } = mercatorCamera(view, window);
  const map = new maplibregl.Map({
    container,
    style: MAP_STYLE.url,
    center,
    zoom,
    interactive: false,
    attributionControl: false,
    fadeDuration: 0,
    pixelRatio: 1,
    // Keeps the WebGL frame readable after it is presented.
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });

  try {
    const ready = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), RENDER_TIMEOUT_MS);
      map.once("idle", () => {
        clearTimeout(timer);
        resolve(map.loaded());
      });
    });
    if (!ready) return null;
    // Copy out before the map (and its GL context) is torn down.
    const snapshot = document.createElement("canvas");
    snapshot.width = window.width;
    snapshot.height = window.height;
    snapshot
      .getContext("2d")
      ?.drawImage(map.getCanvas(), 0, 0, window.width, window.height);
    return snapshot;
  } catch {
    return null;
  } finally {
    map.remove();
    container.remove();
  }
}

/**
 * Draws the themed basemap into the poster's map window. Resolves to
 * false when the basemap could not render (offline etc.) so the caller
 * can keep the plain-paper fallback.
 */
export async function drawBasemap(
  ctx: CanvasRenderingContext2D,
  view: MercatorView,
  window: TileWindow,
  mapFilter: string,
  paper: string,
): Promise<boolean> {
  const basemap = await renderBasemap(view, window).catch(() => null);
  if (!basemap) return false;

  ctx.save();
  ctx.beginPath();
  ctx.rect(window.x, window.y, window.width, window.height);
  ctx.clip();

  // Theme the basemap like the live map; Safari lacks ctx.filter, so fall
  // back to a paper wash that keeps the poster harmonious.
  ctx.filter = mapFilter;
  const filterApplied = ctx.filter !== "none";
  ctx.drawImage(basemap, window.x, window.y, window.width, window.height);
  ctx.filter = "none";

  if (!filterApplied) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = paper;
    ctx.fillRect(window.x, window.y, window.width, window.height);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
  return true;
}

/** `#rrggbb` → fully transparent same-hue stop (avoids gray fade bands). */
const transparent = (hex: string) =>
  /^#[0-9a-f]{6}$/i.test(hex) ? `${hex}00` : "rgba(255,255,255,0)";

/** Soft paper fade on every edge so the map melts into the poster. */
export function fadeTileEdges(
  ctx: CanvasRenderingContext2D,
  window: TileWindow,
  paper: string,
) {
  const fade = 110;
  const edges: [number, number, number, number][] = [
    [window.x, window.y, window.x, window.y + fade],
    [window.x, window.y + window.height, window.x, window.y + window.height - fade],
    [window.x, window.y, window.x + fade, window.y],
    [window.x + window.width, window.y, window.x + window.width - fade, window.y],
  ];
  for (const [x0, y0, x1, y1] of edges) {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, paper);
    gradient.addColorStop(1, transparent(paper));
    ctx.fillStyle = gradient;
    ctx.fillRect(window.x, window.y, window.width, window.height);
  }
}
