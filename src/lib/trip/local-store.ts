import { nanoid } from "nanoid";
import * as z from "zod";

import { tripFingerprint } from "./fingerprint";
import { TripSchema, type Trip } from "./schema";
import { clearTripTools } from "./tools-store";

/**
 * Client-side persistence for the creator's editable trips — plain
 * localStorage CRUD, isomorphic-safe (every export guards on
 * `typeof window` so it can be imported from server code without crashing).
 */

const INDEX_KEY = "trips:index";
const LOCAL_ID_LENGTH = 8;

const recordKey = (id: string) => `trips:${id}`;

const IndexSchema = z.array(z.string());

/** The creator's last share of a local trip, and what it looked like then. */
const SharedSchema = z.object({
  id: z.string(),
  at: z.number(),
  fingerprint: z.string(),
});

const RecordSchema = z.object({
  trip: TripSchema,
  updatedAt: z.number(),
  shared: SharedSchema.optional(),
});

export type LocalTripShare = z.infer<typeof SharedSchema>;

export type LocalTripRecord = {
  id: string;
  trip: Trip;
  updatedAt: number;
  shared?: LocalTripShare;
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

  // Overwrites keep the share history so "edited since sharing" still shows.
  const shared = id ? getLocalTrip(id)?.shared : undefined;
  writeRecord(targetId, { trip, updatedAt: Date.now(), shared });

  const ids = readIndex();
  if (!ids.includes(targetId)) writeIndex([...ids, targetId]);

  return targetId;
}

function writeRecord(id: string, record: z.infer<typeof RecordSchema>) {
  window.localStorage.setItem(recordKey(id), JSON.stringify(record));
}

/** Remember that this local trip was just shared as `shareId`. */
export function markLocalTripShared(id: string, shareId: string): void {
  const record = getLocalTrip(id);
  if (!record) return;
  writeRecord(id, {
    trip: record.trip,
    updatedAt: record.updatedAt,
    shared: {
      id: shareId,
      at: Date.now(),
      fingerprint: tripFingerprint(record.trip),
    },
  });
}

/** True when a shared local trip has been edited since that share. */
export function isShareStale(record: LocalTripRecord): boolean {
  return (
    record.shared !== undefined &&
    record.shared.fingerprint !== tripFingerprint(record.trip)
  );
}

/** Copy a local trip into a new record titled "… (copy)"; returns its id. */
export function duplicateLocalTrip(id: string): string | null {
  const record = getLocalTrip(id);
  if (!record) return null;
  const title = `${record.trip.title} (copy)`.slice(0, 80);
  return saveLocalTrip({ ...record.trip, title, createdAt: Date.now() });
}

/** Save an imported trip as a new local record, created now; returns its id. */
export function importLocalTrip(trip: Trip): string {
  return saveLocalTrip({ ...trip, createdAt: Date.now() });
}

/** Remove a local trip, its index entry and its packing/notes. No-op if missing. */
export function deleteLocalTrip(id: string): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(recordKey(id));
  clearTripTools({ kind: "local", id });
  writeIndex(readIndex().filter((existing) => existing !== id));
}
