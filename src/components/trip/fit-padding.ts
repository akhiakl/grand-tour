export interface FitPadding {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
}

const MARGIN = 56;
/** Stop labels hang to the right of their dot; leave them room. */
const LABEL_ROOM = 64;

/**
 * Padding for fitting the route: a plain margin (wider on the right, where
 * stop labels sit), plus whatever the mobile
 * bottom sheet covers along the bottom (0 when the panel is docked beside
 * the map), so no stop lands under the sheet.
 */
export function fitPadding(bottomInset = 0): FitPadding {
  return {
    paddingTopLeft: [MARGIN, MARGIN],
    paddingBottomRight: [MARGIN + LABEL_ROOM, MARGIN + Math.max(0, bottomInset)],
  };
}
