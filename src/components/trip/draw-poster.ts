import {
  arcPoints,
  labelSide,
  makeMercatorView,
  routePath,
  tripStats,
  type LatLng,
  type PosterPoint,
  type Trip,
} from "@/lib/trip";

import { MODE_META } from "./mode";
import { drawTileLayer, fadeTileEdges, type TileWindow } from "./poster-tiles";

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;

/** Brand values resolved from CSS custom properties at draw time. */
export interface PosterTheme {
  paper: string;
  ink: string;
  inkSoft: string;
  brass: string;
  azure: string;
  line: string;
  cardSolid: string;
  mapFilter: string;
}

export interface PosterFonts {
  display: string;
  sans: string;
}

/** The basemap window (frame-inset, between header and footer). */
const WIN: TileWindow = { x: 40, y: 288, width: POSTER_WIDTH - 80, height: 820 };
const EDGE = 84;

function drawBackground(ctx: CanvasRenderingContext2D, theme: PosterTheme) {
  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // Faint atlas graticule (visible where tiles fade out or fail to load).
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  for (let x = 108; x < POSTER_WIDTH; x += 108) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, POSTER_HEIGHT);
    ctx.stroke();
  }
  for (let y = 108; y < POSTER_HEIGHT; y += 108) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(POSTER_WIDTH, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawFrame(ctx: CanvasRenderingContext2D, theme: PosterTheme) {
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(36, 36, POSTER_WIDTH - 72, POSTER_HEIGHT - 72, 24);
  ctx.stroke();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  trip: Trip,
  theme: PosterTheme,
  fonts: PosterFonts,
) {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  ctx.fillStyle = theme.brass;
  ctx.font = `600 22px ${fonts.sans}`;
  ctx.letterSpacing = "8px";
  ctx.fillText("FIELD ATLAS", EDGE, 132);
  ctx.letterSpacing = "0px";

  const words = trip.title.split(" ");
  let x = EDGE;
  words.forEach((word, i) => {
    const accent = i === 1 && words.length > 1;
    ctx.font = `${accent ? "italic 500" : "500"} 76px ${fonts.display}`;
    ctx.fillStyle = accent ? theme.azure : theme.ink;
    ctx.fillText(word, x, 216);
    x += ctx.measureText(word).width + 20;
  });

  ctx.fillStyle = theme.inkSoft;
  ctx.font = `400 27px ${fonts.sans}`;
  ctx.fillText(trip.cities.map((c) => c.name).join("  →  "), EDGE, 268);
}

function drawRoute(
  ctx: CanvasRenderingContext2D,
  trip: Trip,
  theme: PosterTheme,
  fonts: PosterFonts,
  toCanvas: (ll: LatLng) => PosterPoint,
) {
  const stops = trip.cities.map((city) => city.ll as LatLng);

  const path = routePath(stops).map(toCanvas);
  ctx.strokeStyle = theme.brass;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.setLineDash([2, 18]);
  ctx.beginPath();
  path.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.stroke();
  ctx.setLineDash([]);

  trip.legs.forEach((leg, i) => {
    const mid = toCanvas(arcPoints(stops[i], stops[i + 1], 2)[1]);
    ctx.fillStyle = theme.cardSolid;
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(mid.x, mid.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = `24px ${fonts.sans}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(MODE_META[leg.mode].emoji, mid.x, mid.y + 2);
  });

  const projected = trip.cities.map((city) => toCanvas(city.ll as LatLng));
  trip.cities.forEach((city, i) => {
    const { x, y } = projected[i];

    ctx.fillStyle = theme.paper;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.brass;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = theme.brass;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    const side = labelSide(projected[i], projected);
    const labelY = side === "above" ? y - 36 : y + 56;
    ctx.font = `600 30px ${fonts.display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.lineWidth = 10;
    ctx.strokeStyle = theme.paper;
    ctx.lineJoin = "round";
    const clampedX = Math.min(Math.max(x, EDGE + 80), POSTER_WIDTH - EDGE - 80);
    ctx.strokeText(city.name, clampedX, labelY);
    ctx.fillStyle = theme.ink;
    ctx.fillText(city.name, clampedX, labelY);
  });
}

function drawAttribution(
  ctx: CanvasRenderingContext2D,
  theme: PosterTheme,
  fonts: PosterFonts,
) {
  ctx.fillStyle = theme.inkSoft;
  ctx.font = `400 16px ${fonts.sans}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 0.85;
  ctx.fillText(
    "Map © OpenStreetMap · © CARTO",
    WIN.x + WIN.width - 14,
    WIN.y + WIN.height - 14,
  );
  ctx.globalAlpha = 1;
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  trip: Trip,
  theme: PosterTheme,
  fonts: PosterFonts,
) {
  const stats = tripStats(trip);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = theme.ink;
  ctx.font = `400 28px ${fonts.sans}`;
  ctx.fillText(
    `${stats.nights} nights · ${stats.cities} cities · ${stats.countries} ${
      stats.countries === 1 ? "country" : "countries"
    } · ~${stats.totalKm.toLocaleString("en-US")} km`,
    POSTER_WIDTH / 2,
    1158,
  );
  ctx.fillStyle = theme.inkSoft;
  ctx.font = `400 25px ${fonts.sans}`;
  ctx.fillText(
    `€${stats.budget[0].toLocaleString("en-US")}–${stats.budget[1].toLocaleString("en-US")} per person`,
    POSTER_WIDTH / 2,
    1198,
  );

  ctx.strokeStyle = theme.brass;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(POSTER_WIDTH / 2 - 34, 1234);
  ctx.lineTo(POSTER_WIDTH / 2 + 34, 1234);
  ctx.stroke();

  ctx.fillStyle = theme.brass;
  ctx.font = `italic 500 27px ${fonts.display}`;
  ctx.fillText("Grand Tour", POSTER_WIDTH / 2, 1276);
}

/**
 * Renders the shareable route poster (1080×1350, Instagram 4:5):
 * themed basemap tiles under the brass route, faded into the paper.
 */
export async function drawPoster(
  canvas: HTMLCanvasElement,
  trip: Trip,
  theme: PosterTheme,
  fonts: PosterFonts,
) {
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");

  const stops = trip.cities.map((city) => city.ll as LatLng);
  const view = makeMercatorView(stops, {
    width: WIN.width,
    height: WIN.height,
    padding: 130,
  });
  const toCanvas = (ll: LatLng) => {
    const point = view.project(ll);
    return { x: point.x + WIN.x, y: point.y + WIN.y };
  };

  drawBackground(ctx, theme);
  const hasTiles = await drawTileLayer(ctx, view, WIN, theme.mapFilter, theme.paper);
  if (hasTiles) fadeTileEdges(ctx, WIN, theme.paper);
  drawFrame(ctx, theme);
  drawHeader(ctx, trip, theme, fonts);
  drawRoute(ctx, trip, theme, fonts, toCanvas);
  if (hasTiles) drawAttribution(ctx, theme, fonts);
  drawFooter(ctx, trip, theme, fonts);
}
