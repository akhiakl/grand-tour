export interface FitPadding {
  paddingTopLeft: [number, number];
  paddingBottomRight: [number, number];
}

const PLAIN: FitPadding = { paddingTopLeft: [72, 72], paddingBottomRight: [72, 72] };

/**
 * Padding for fitting the route inside the full-bleed experience, so stops
 * don't land under its floating chrome: top bar, the stats strip (left,
 * md+), and the timeline rail plus landing CTA row along the bottom.
 * Embedded maps without chrome (editor preview) keep a plain margin.
 */
export function fitPadding(width: number, withChrome: boolean): FitPadding {
  if (!withChrome) return PLAIN;
  if (width >= 768) {
    return { paddingTopLeft: [250, 120], paddingBottomRight: [80, 230] };
  }
  return { paddingTopLeft: [40, 150], paddingBottomRight: [40, 230] };
}
