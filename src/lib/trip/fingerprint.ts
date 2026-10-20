import type { Trip } from "./schema";

/**
 * A short, stable hash of what a viewer would see in a trip (everything
 * but `createdAt`/`createdBy`), so the creator can tell whether a local
 * trip still matches the snapshot they shared. FNV-1a, 32-bit: collisions
 * only risk a missed "share again" nudge, never data loss.
 */
export function tripFingerprint(trip: Trip): string {
  const { title, cities, legs, startDate } = trip;
  const text = JSON.stringify([title, cities, legs, startDate ?? null]);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
