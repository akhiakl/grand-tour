export interface FitPadding {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
}

/** Pixels of map covered by the atlas card (left on desktop, bottom on mobile). */
export interface MapInsets {
  bottom?: number;
  left?: number;
}

const MARGIN = 56;
/** Tightest margin, used when the sheet leaves little map visible. */
const MIN_MARGIN = 16;
/** Stop labels hang to the right of their dot; leave them room. */
const LABEL_ROOM = 64;
/** Visible height (px) below which vertical margins shrink. */
const ROOMY_HEIGHT = 420;

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
  const bottom = Math.max(0, insets.bottom ?? 0);
  const left = Math.max(0, insets.left ?? 0);
  const vertical = mapHeight - bottom < ROOMY_HEIGHT ? MIN_MARGIN : MARGIN;
  return {
    paddingTopLeft: [left + MARGIN, vertical],
    paddingBottomRight: [MARGIN + LABEL_ROOM, vertical + bottom],
  };
}
