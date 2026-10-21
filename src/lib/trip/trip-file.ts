import * as z from "zod";

import { MAX_TRIP_PAYLOAD_BYTES, TripSchema, type Trip } from "./schema";

/**
 * Backup files for local trips: My Maps exports a trip as JSON and can
 * import it back (on this or another device), since localStorage is the
 * only copy of a guest's editable maps.
 */
const FILE_APP = "grand-tour";
const FILE_VERSION = 1;

/** Generous next to the share cap: a file is a backup, not a share. */
const MAX_FILE_CHARS = MAX_TRIP_PAYLOAD_BYTES * 4;

const EnvelopeSchema = z.object({
  app: z.literal(FILE_APP),
  version: z.literal(FILE_VERSION),
  trip: z.unknown(),
});

export type TripFileError = "too_large" | "not_json" | "not_a_trip";

export type TripFileResult =
  { ok: true; trip: Trip } | { ok: false; error: TripFileError };

/** A filesystem-safe name from a trip title, e.g. "Alps, slowly" → "alps-slowly". */
export const tripFileSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "grand-tour";

export function serializeTripFile(trip: Trip): string {
  return JSON.stringify({ app: FILE_APP, version: FILE_VERSION, trip }, null, 2);
}

/** Read an exported file (or a bare trip JSON), validated like any trip. */
export function parseTripFile(text: string): TripFileResult {
  if (text.length > MAX_FILE_CHARS) return { ok: false, error: "too_large" };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "not_json" };
  }
  const envelope = EnvelopeSchema.safeParse(data);
  const parsed = TripSchema.safeParse(envelope.success ? envelope.data.trip : data);
  return parsed.success
    ? { ok: true, trip: parsed.data }
    : { ok: false, error: "not_a_trip" };
}
