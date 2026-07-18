import "server-only";

import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

import { TripSchema, type Trip } from "./schema";

/**
 * Service layer over Upstash Redis — plain transport-agnostic functions.
 * Only route handlers and server components may import this module.
 */

/** Shared snapshots live for 60 days; every read slides the window. */
export const TRIP_TTL_SECONDS = 60 * 24 * 60 * 60;

/** Length of the short share id used in `/t/{id}` links. */
export const TRIP_ID_LENGTH = 8;

const tripKey = (id: string) => `trip:${id}`;
const viewsKey = (id: string) => `views:${id}`;

let client: Redis | null = null;

const redis = (): Redis => (client ??= Redis.fromEnv());

/** Persist an immutable snapshot; returns its short share id. */
export async function saveTrip(trip: Trip): Promise<string> {
  // Re-validate at the boundary so any future transport stays gated.
  const snapshot = TripSchema.parse(trip);
  const id = nanoid(TRIP_ID_LENGTH);
  await redis().setex(tripKey(id), TRIP_TTL_SECONDS, snapshot);
  return id;
}

/** Fetch a snapshot, refreshing its TTL so popular links stay alive. */
export async function getTrip(id: string): Promise<Trip | null> {
  const stored = await redis().getex(tripKey(id), { ex: TRIP_TTL_SECONDS });
  if (stored === null || stored === undefined) return null;
  const parsed = TripSchema.safeParse(stored);
  return parsed.success ? parsed.data : null;
}

/** Count a view; the counter expires alongside its snapshot. */
export async function incrViews(id: string): Promise<number> {
  const views = await redis().incr(viewsKey(id));
  await redis().expire(viewsKey(id), TRIP_TTL_SECONDS);
  return views;
}
