export interface FitPadding {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
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
 * labels sit), plus whatever the mobile bottom sheet covers along the
 * bottom (0 when the panel is docked beside the map), so no stop lands
 * under the sheet. When the sheet leaves only a strip of map, vertical
 * margins tighten so the route still fits at the minimum zoom.
 */
export function fitPadding(bottomInset = 0, mapHeight = Infinity): FitPadding {
  const inset = Math.max(0, bottomInset);
  const vertical = mapHeight - inset < ROOMY_HEIGHT ? MIN_MARGIN : MARGIN;
  return {
    paddingTopLeft: [MARGIN, vertical],
    paddingBottomRight: [MARGIN + LABEL_ROOM, vertical + inset],
  };
}
