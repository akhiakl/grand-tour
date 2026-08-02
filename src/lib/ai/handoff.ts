import { AiTripSchema, type AiTrip } from "./schema";

/**
 * One-shot localStorage handoff from the AI chat flow (step 6) to the
 * manual editor (`/new?from=ai`): the chat writes a drafted trip here,
 * the editor reads and clears it on mount. Isomorphic-safe like the trip
 * domain's local store — guarded on `typeof window`.
 */
const HANDOFF_KEY = "trips:ai-handoff";

const hasStorage = () => typeof window !== "undefined";

/** Stash a freshly generated trip for the editor to pick up next load. */
export function writeAiHandoff(trip: AiTrip): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(HANDOFF_KEY, JSON.stringify(trip));
}

/** Read and consume the handoff; corrupt or missing payloads read as null. */
export function readAndClearAiHandoff(): AiTrip | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(HANDOFF_KEY);
  window.localStorage.removeItem(HANDOFF_KEY);
  if (!raw) return null;
  try {
    const parsed = AiTripSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
