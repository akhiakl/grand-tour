import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

import { SHARE_TTL_DAYS, TripSchema, type Trip } from "./schema";

/**
 * Service layer over Upstash Redis — plain transport-agnostic functions.
 * Only route handlers and server components may import this module.
 */

/** Shared snapshots live for 60 days; every read slides the window. */
export const TRIP_TTL_SECONDS = SHARE_TTL_DAYS * 24 * 60 * 60;

/** Length of the short share id used in `/t/{id}` links. */
export const TRIP_ID_LENGTH = 8;

const tripKey = (id: string) => `trip:${id}`;
const viewsKey = (id: string) => `views:${id}`;

let client: Redis | null = null;

const redis = (): Redis => (client ??= Redis.fromEnv());

/** Times one store call in Sentry; no trip data or ids go on the span. */
const traced = <T>(name: string, run: () => Promise<T>): Promise<T> =>
  Sentry.startSpan({ name, op: "db.redis" }, run);

/** Persist an immutable snapshot; returns its short share id. */
export async function saveTrip(trip: Trip): Promise<string> {
  // Re-validate at the boundary so any future transport stays gated.
  const snapshot = TripSchema.parse(trip);
  const id = nanoid(TRIP_ID_LENGTH);
  await traced("redis.save_trip", () =>
    redis().setex(tripKey(id), TRIP_TTL_SECONDS, snapshot),
  );
  return id;
}

/** Fetch a snapshot, refreshing its TTL so popular links stay alive. */
export async function getTrip(id: string): Promise<Trip | null> {
  const stored = await traced("redis.get_trip", () =>
    redis().getex(tripKey(id), { ex: TRIP_TTL_SECONDS }),
  );
  if (stored === null || stored === undefined) return null;
  const parsed = TripSchema.safeParse(stored);
  return parsed.success ? parsed.data : null;
}

/** Count a view; the counter expires alongside its snapshot. */
export async function incrViews(id: string): Promise<number> {
  return traced("redis.incr_views", async () => {
    const views = await redis().incr(viewsKey(id));
    await redis().expire(viewsKey(id), TRIP_TTL_SECONDS);
    return views;
  });
}

/**
 * Whether the store answers within `timeoutMs`; for health checks, so a
 * hung connection reports "down" instead of hanging the monitor.
 */
export async function pingStore(timeoutMs = 2000): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<false>((resolve) => {
    timer = setTimeout(() => resolve(false), timeoutMs);
  });
  // Caught here, not around the race: a ping that fails after the timeout
  // has won must not surface as an unhandled rejection.
  const answered = Promise.resolve()
    .then(() => redis().ping())
    .then((reply) => reply === "PONG")
    .catch(() => false);
  try {
    return await Promise.race([answered, timedOut]);
  } finally {
    clearTimeout(timer);
  }
}
