/** Screen-space rectangle, as returned by `getBoundingClientRect`. */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface LabelCandidate {
  id: string;
  /** Allowed placements in order of preference (e.g. right of the dot, then left). */
  options: Box[];
  /** Never hidden (the selected stop): falls back to its first option. */
  keep?: boolean;
}

export interface DeclutterInput {
  /** In priority order: earlier labels claim space first. */
  labels: LabelCandidate[];
  badges: { id: string; box: Box }[];
  /** Fixed marks nothing may cover (stop dots). */
  obstacles: Box[];
  /** The visible map: label options poking outside it are skipped. */
  viewport?: Box;
}

export interface DeclutterResult {
  /** Chosen option index per label, or null when it's hidden. */
  placement: Map<string, number | null>;
  hiddenBadges: Set<string>;
}

const GAP = 2;

export function overlaps(a: Box, b: Box): boolean {
  return (
    a.left < b.right + GAP &&
    b.left < a.right + GAP &&
    a.top < b.bottom + GAP &&
    b.top < a.bottom + GAP
  );
}

/** Mirror a box horizontally around `x` (a label flipped to the dot's other side). */
export function mirrorX(box: Box, x: number): Box {
  return { ...box, left: 2 * x - box.right, right: 2 * x - box.left };
}

/**
 * Greedy label placement: each label takes its first option that stays on
 * screen and collides with nothing placed so far, or hides; transport badges then hide
 * wherever they would sit on a label, a dot or another badge.
 */
export function declutter({
  labels,
  badges,
  obstacles,
  viewport,
}: DeclutterInput): DeclutterResult {
  const placed = [...obstacles];
  const placement = new Map<string, number | null>();
  const free = (box: Box) => !placed.some((other) => overlaps(box, other));
  const visible = (box: Box) =>
    !viewport || (box.left >= viewport.left && box.right <= viewport.right);

  for (const label of labels) {
    let choice = label.options.findIndex((box) => visible(box) && free(box));
    if (choice === -1 && label.keep) choice = 0;
    placement.set(label.id, choice === -1 ? null : choice);
    if (choice !== -1) placed.push(label.options[choice]);
  }

  const hiddenBadges = new Set<string>();
  for (const badge of badges) {
    if (free(badge.box)) placed.push(badge.box);
    else hiddenBadges.add(badge.id);
  }

  return { placement, hiddenBadges };
}
