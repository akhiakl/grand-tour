import { nanoid } from "nanoid";
import { z } from "zod";

import { TripSchema, type Trip } from "./schema";

/**
 * Client-side persistence for the creator's editable trips — plain
 * localStorage CRUD, isomorphic-safe (every export guards on
 * `typeof window` so it can be imported from server code without crashing).
 */

const INDEX_KEY = "trips:index";
const LOCAL_ID_LENGTH = 8;

const recordKey = (id: string) => `trips:${id}`;

const IndexSchema = z.array(z.string());

const RecordSchema = z.object({
  trip: TripSchema,
  updatedAt: z.number(),
});

export type LocalTripRecord = {
  id: string;
  trip: Trip;
  updatedAt: number;
};

const hasStorage = () => typeof window !== "undefined";

function readIndex(): string[] {
  if (!hasStorage()) return [];
  const raw = window.localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = IndexSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  if (!hasStorage()) return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

/** Read one trip record; corrupt or schema-invalid entries read as null. */
export function getLocalTrip(id: string): LocalTripRecord | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(recordKey(id));
  if (!raw) return null;
  try {
    const parsed = RecordSchema.safeParse(JSON.parse(raw));
    return parsed.success ? { id, ...parsed.data } : null;
  } catch {
    return null;
  }
}

/**
 * List every local trip, newest-updated first. Index entries that no
 * longer resolve to a valid, schema-conforming record are dropped and the
 * index is pruned so the corruption doesn't resurface on the next read.
 */
export function listLocalTrips(): LocalTripRecord[] {
  const ids = readIndex();
  const records: LocalTripRecord[] = [];
  const survivingIds: string[] = [];

  for (const id of ids) {
    const record = getLocalTrip(id);
    if (record) {
      records.push(record);
      survivingIds.push(id);
    }
  }

  if (survivingIds.length !== ids.length) writeIndex(survivingIds);

  return records.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Create or update a local trip. Omit `id` to create a new one (returned).
 * Passing an existing `id` overwrites that trip in place.
 */
export function saveLocalTrip(trip: Trip, id?: string): string {
  const targetId = id ?? nanoid(LOCAL_ID_LENGTH);
  if (!hasStorage()) return targetId;

  const record: z.infer<typeof RecordSchema> = { trip, updatedAt: Date.now() };
  window.localStorage.setItem(recordKey(targetId), JSON.stringify(record));

  const ids = readIndex();
  if (!ids.includes(targetId)) writeIndex([...ids, targetId]);

  return targetId;
}

/** Remove a local trip and its index entry. No-op if it doesn't exist. */
export function deleteLocalTrip(id: string): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(recordKey(id));
  writeIndex(readIndex().filter((existing) => existing !== id));
}
