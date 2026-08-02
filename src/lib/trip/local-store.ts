import { nanoid } from "nanoid";

import { TripSchema, type Trip } from "./schema";

/** Local (unpublished) trip ids are shorter than share ids — same alphabet, different pool. */
const LOCAL_ID_LENGTH = 8;

const INDEX_KEY = "trips:index";
const tripKey = (id: string) => `trips:${id}`;

/** SSR-safe: the store no-ops server-side rather than throwing. */
function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readIndex(): string[] {
  if (!hasLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]): void {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

/** Reads and Zod-validates one trip; silently drops (and de-indexes) corrupt entries. */
function readTrip(id: string): Trip | null {
  if (!hasLocalStorage()) return null;

  const raw = window.localStorage.getItem(tripKey(id));
  if (!raw) return null;

  let parsed;
  try {
    parsed = TripSchema.safeParse(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(tripKey(id));
    writeIndex(readIndex().filter((existing) => existing !== id));
    return null;
  }
  if (parsed.success) return parsed.data;

  window.localStorage.removeItem(tripKey(id));
  writeIndex(readIndex().filter((existing) => existing !== id));
  return null;
}

export interface LocalTrip {
  id: string;
  trip: Trip;
}

/** Every locally saved trip, newest-touched first. Corrupt entries are dropped. */
export function listLocalTrips(): LocalTrip[] {
  return readIndex()
    .map((id) => {
      const trip = readTrip(id);
      return trip ? { id, trip } : null;
    })
    .filter((entry): entry is LocalTrip => entry !== null)
    .sort((a, b) => b.trip.createdAt - a.trip.createdAt);
}

export function getLocalTrip(id: string): Trip | null {
  return readTrip(id);
}

/**
 * Creates or overwrites a local trip. Omit `id` to create one (fresh
 * `nanoid(8)`); pass an existing id to save in place. `createdAt` is
 * stamped to now on every save — local drafts have no separate "last
 * updated" field, so this one doubles as it for the My Maps list.
 */
export function saveLocalTrip(trip: Trip, id?: string): string {
  const targetId = id ?? nanoid(LOCAL_ID_LENGTH);
  if (!hasLocalStorage()) return targetId;

  const stamped = TripSchema.parse({ ...trip, createdAt: Date.now() });
  window.localStorage.setItem(tripKey(targetId), JSON.stringify(stamped));

  const index = readIndex();
  if (!index.includes(targetId)) writeIndex([...index, targetId]);

  return targetId;
}

/** No auto-deletion anywhere else in the app — this is the only path out. */
export function deleteLocalTrip(id: string): void {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(tripKey(id));
  writeIndex(readIndex().filter((existing) => existing !== id));
}

/** One-shot handoff key the AI flow writes to before sending the guest to `/new?from=ai`. */
export const AI_HANDOFF_KEY = "trips:ai-handoff";

/** Reads and clears the AI handoff payload; drops it silently if it fails validation. */
export function consumeAiHandoff(): Trip | null {
  if (!hasLocalStorage()) return null;

  const raw = window.localStorage.getItem(AI_HANDOFF_KEY);
  window.localStorage.removeItem(AI_HANDOFF_KEY);
  if (!raw) return null;

  try {
    const parsed = TripSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
