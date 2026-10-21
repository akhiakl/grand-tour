/**
 * Undo/redo over immutable snapshots. Edits tagged with the same `group`
 * in quick succession (typing in one field) coalesce into one step, so
 * undo rewinds a word or a field rather than a keystroke.
 */
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  /** Group and time of the most recent edit, for coalescing. */
  last?: { group: string; at: number };
}

const MAX_STEPS = 100;
const COALESCE_MS = 1000;

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/** Record `next`; `group` (e.g. "title") coalesces rapid edits to one field. */
export function pushHistory<T>(
  history: History<T>,
  next: T,
  now: number,
  group?: string,
): History<T> {
  if (Object.is(next, history.present)) return history;
  const last = group ? { group, at: now } : undefined;
  const coalesce =
    group !== undefined &&
    history.last?.group === group &&
    now - history.last.at < COALESCE_MS;

  if (coalesce) return { ...history, present: next, future: [], last };
  return {
    past: [...history.past, history.present].slice(-MAX_STEPS),
    present: next,
    future: [],
    last,
  };
}

/** {@link pushHistory} stamped with the current time. */
export function recordEdit<T>(
  history: History<T>,
  next: T,
  group?: string,
): History<T> {
  return pushHistory(history, next, Date.now(), group);
}

export function undoHistory<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1);
  if (previous === undefined) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future;
  if (next === undefined) return history;
  return { past: [...history.past, history.present], present: next, future: rest };
}
