import {
  pickTileZoom,
  tilesInView,
  type MercatorView,
  type TilePlacement,
} from "@/lib/trip";

export interface TileWindow {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SUBDOMAINS = ["a", "b", "c", "d"];
const MAX_TILES = 40;

const tileUrl = (z: number, x: number, y: number, i: number) =>
  `https://${SUBDOMAINS[i % SUBDOMAINS.length]}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/${z}/${x}/${y}@2x.png`;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // CARTO serves CORS-enabled tiles; anonymous keeps the canvas clean.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`tile failed: ${url}`));
    img.src = url;
  });
}

function placements(view: MercatorView, window: TileWindow) {
  // Tile math runs in box space (window-local origin).
  const local = { x: 0, y: 0, width: window.width, height: window.height };
  let zoom = pickTileZoom(view.worldPx);
  let tiles = tilesInView(view, local, zoom);
  while (tiles.length > MAX_TILES && zoom > 2) {
    zoom -= 1;
    tiles = tilesInView(view, local, zoom);
  }
  return { zoom, tiles };
}

/**
 * Draws the themed basemap into the poster's map window. Resolves to
 * false when no tile could be fetched (offline etc.) so the caller can
 * keep the plain-paper fallback.
 */
export async function drawTileLayer(
  ctx: CanvasRenderingContext2D,
  view: MercatorView,
  window: TileWindow,
  mapFilter: string,
  paper: string,
): Promise<boolean> {
  const { zoom, tiles } = placements(view, window);

  const settled = await Promise.allSettled(
    tiles.map((tile, i) => loadImage(tileUrl(zoom, tile.x, tile.y, i))),
  );
  const loaded: { tile: TilePlacement; img: HTMLImageElement }[] = [];
  settled.forEach((result, i) => {
    if (result.status === "fulfilled") {
      loaded.push({ tile: tiles[i], img: result.value });
    }
  });
  if (loaded.length === 0) return false;

  ctx.save();
  ctx.beginPath();
  ctx.rect(window.x, window.y, window.width, window.height);
  ctx.clip();

  // Theme the tiles like the live map; Safari lacks ctx.filter, so fall
  // back to a paper wash that keeps the poster harmonious.
  ctx.filter = mapFilter;
  const filterApplied = ctx.filter !== "none";
  for (const { tile, img } of loaded) {
    // +0.5 hides sub-pixel seams between scaled tiles.
    ctx.drawImage(
      img,
      window.x + tile.px,
      window.y + tile.py,
      tile.size + 0.5,
      tile.size + 0.5,
    );
  }
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
