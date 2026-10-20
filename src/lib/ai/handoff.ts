import {
  AiTripSchema,
  GenerateRequestSchema,
  type AiTrip,
  type GenerateRequest,
} from "./schema";

/**
 * One-shot localStorage handoff from the AI chat flow (step 6) to the
 * manual editor (`/new?from=ai`): the chat writes a drafted trip (and the
 * answers that produced it, so the editor can offer a redraft) here; the
 * editor reads it while rendering and clears it once mounted. Reading
 * never clears, because React may run a render (and its state
 * initializers) more than once before committing it. Isomorphic-safe like
 * the trip domain's local store — guarded on `typeof window`.
 */
const HANDOFF_KEY = "trips:ai-handoff";

export type AiHandoff = AiTrip & { request?: GenerateRequest };

const hasStorage = () => typeof window !== "undefined";

/** Stash a freshly generated trip for the editor to pick up next load. */
export function writeAiHandoff(trip: AiTrip, request?: GenerateRequest): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(HANDOFF_KEY, JSON.stringify({ ...trip, request }));
}

/** Read the handoff without consuming it; corrupt or missing reads as null. */
export function readAiHandoff(): AiHandoff | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(HANDOFF_KEY);
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    const trip = AiTripSchema.safeParse(data);
    if (!trip.success) return null;
    // The request is a nicety (it seeds the redraft form): drop it if bad.
    const request = GenerateRequestSchema.safeParse(
      (data as { request?: unknown }).request,
    );
    return request.success ? { ...trip.data, request: request.data } : trip.data;
  } catch {
    return null;
  }
}

/** Drop the handoff once the editor has taken it. */
export function clearAiHandoff(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(HANDOFF_KEY);
}
