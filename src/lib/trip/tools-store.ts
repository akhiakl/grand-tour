import { z } from "zod";

/**
 * A viewer's own packing ticks, extra items and notes for one trip,
 * kept in this browser's localStorage. Never part of the shared snapshot:
 * two people opening the same `/t/{id}` link each keep their own list.
 */
const MAX_NOTES_LENGTH = 10_000;
const MAX_CUSTOM_ITEMS = 30;

const ToolsSchema = z.object({
  checked: z.array(z.string()).default([]),
  custom: z.array(z.string().max(80)).max(MAX_CUSTOM_ITEMS).default([]),
  /** Suggested packing items (by id) the viewer removed from their list. */
  hidden: z.array(z.string()).default([]),
  notes: z.string().max(MAX_NOTES_LENGTH).default(""),
});

export type TripToolsState = z.infer<typeof ToolsSchema>;

/** Which trip a tools record belongs to; one namespace per host page. */
export type TripToolsScope =
  { kind: "shared"; id: string } | { kind: "local"; id: string } | { kind: "demo" };

export const EMPTY_TRIP_TOOLS: TripToolsState = {
  checked: [],
  custom: [],
  hidden: [],
  notes: "",
};

export function tripToolsKey(scope: TripToolsScope): string {
  return scope.kind === "demo"
    ? "trip-tools:demo"
    : `trip-tools:${scope.kind}:${scope.id}`;
}

const hasStorage = () => typeof window !== "undefined";

/** Saved tools for a trip; missing or corrupt records read as empty. */
export function readTripTools(scope: TripToolsScope): TripToolsState {
  if (!hasStorage()) return EMPTY_TRIP_TOOLS;
  const raw = window.localStorage.getItem(tripToolsKey(scope));
  if (!raw) return EMPTY_TRIP_TOOLS;
  try {
    const parsed = ToolsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_TRIP_TOOLS;
  } catch {
    return EMPTY_TRIP_TOOLS;
  }
}

/** Persist tools for a trip, dropping the record once it holds nothing. */
export function writeTripTools(scope: TripToolsScope, state: TripToolsState): void {
  if (!hasStorage()) return;
  const key = tripToolsKey(scope);
  const empty =
    state.checked.length === 0 &&
    state.custom.length === 0 &&
    state.hidden.length === 0 &&
    !state.notes;
  try {
    if (empty) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the tools still work for this visit.
  }
}

export function clearTripTools(scope: TripToolsScope): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(tripToolsKey(scope));
}

export const TRIP_TOOLS_LIMITS = {
  customItems: MAX_CUSTOM_ITEMS,
  notesLength: MAX_NOTES_LENGTH,
} as const;
