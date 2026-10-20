export interface FitPadding {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
}

/**
 * Pixels of map covered by the atlas card: the left column on desktop (or
 * just a top strip while it's collapsed to its head), the bottom on mobile.
 */
export interface MapInsets {
  top?: number;
  bottom?: number;
  left?: number;
}

/** A pixel position or size in map-container coordinates. */
export interface ScreenPoint {
  x: number;
  y: number;
}

const MARGIN = 56;
/** Tightest margin, used when the sheet leaves little map visible. */
const MIN_MARGIN = 16;
/** Stop labels hang to the right of their dot; leave them room. */
const LABEL_ROOM = 64;
/** Visible height (px) below which vertical margins shrink. */
const ROOMY_HEIGHT = 420;
/** Room a focused stop needs around its point: dot plus focus ring. */
const FOCUS_ROOM = 24;

function clampInsets(insets: MapInsets) {
  return {
    top: Math.max(0, insets.top ?? 0),
    bottom: Math.max(0, insets.bottom ?? 0),
    left: Math.max(0, insets.left ?? 0),
  };
}

/**
 * Padding for fitting the route: a margin (wider on the right, where stop
 * labels sit) plus whatever the floating atlas card covers, so no stop
 * lands under it. When the mobile sheet leaves only a strip of map,
 * vertical margins tighten so the route still fits at the minimum zoom.
 */
export function fitPadding(
  insets: MapInsets = {},
  mapHeight = Infinity,
): FitPadding {
  const { top, bottom, left } = clampInsets(insets);
  const vertical = mapHeight - bottom - top < ROOMY_HEIGHT ? MIN_MARGIN : MARGIN;
  return {
    paddingTopLeft: [left + MARGIN, top + vertical],
    paddingBottomRight: [MARGIN + LABEL_ROOM, vertical + bottom],
  };
}

/** Distance to move `value` into `[min, max]` (0 when already inside). */
function shortfall(value: number, min: number, max: number): number {
  if (value < min) return value - min;
  if (value > max) return value - max;
  return 0;
}

/**
 * How far to pan the map (`map.panBy`) so a point lands in the area the
 * atlas card leaves clear, with room for a focused dot and its ring.
 * `[0, 0]` when it's already clear.
 */
export function clearPanOffset(
  point: ScreenPoint,
  insets: MapInsets,
  mapSize: ScreenPoint,
): [number, number] {
  const { top, bottom, left } = clampInsets(insets);
  const dx = shortfall(point.x, left + FOCUS_ROOM, mapSize.x - FOCUS_ROOM);
  const dy = shortfall(point.y, top + FOCUS_ROOM, mapSize.y - bottom - FOCUS_ROOM);
  // `+ 0` normalises -0, so a clear point reads as exactly [0, 0].
  return [dx + 0, dy + 0];
}

/** Whether a stop at `point` sits under the atlas card (or off the map). */
export function isPointObscured(
  point: ScreenPoint,
  insets: MapInsets,
  mapSize: ScreenPoint,
): boolean {
  const [dx, dy] = clearPanOffset(point, insets, mapSize);
  return dx !== 0 || dy !== 0;
}
