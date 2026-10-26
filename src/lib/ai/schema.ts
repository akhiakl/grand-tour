import * as z from "zod";

import { CitySchema, GUEST_MAX_CITIES, LegSchema } from "@/lib/trip";

/** The guided chat's three answers — the only input the generator takes. */
export const VIBES = ["relaxed", "balanced", "packed"] as const;

export const GenerateRequestSchema = z.object({
  destination: z.string().min(2).max(120),
  days: z.number().int().min(2).max(30),
  vibe: z.enum(VIBES),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/**
 * Shape the model must return: trip content plus optional overflow stops.
 * `suggestedExtra` is NOT part of Trip — it feeds the ghost-stop upsell.
 */
export const AiTripSchema = z
  .object({
    title: z.string().min(1).max(80),
    cities: z.array(CitySchema).min(2).max(GUEST_MAX_CITIES),
    legs: z.array(LegSchema),
    suggestedExtra: z.array(z.string().max(60)).max(10).default([]),
  })
  .refine((trip) => trip.legs.length === trip.cities.length - 1, {
    message:
      "legs must connect consecutive cities (legs.length === cities.length - 1)",
    path: ["legs"],
  });

const MAX_EXTRA = 10;
const MAX_EXTRA_NAME = 60;

/**
 * A model that ignores the 5-city rule still gets a useful trip: keep the
 * first 5 cities and their legs, and move the rest into `suggestedExtra`.
 * Only touches well-formed overflow; anything else falls through to the
 * schema (and its retry) unchanged.
 */
export function clampToGuestLimit(json: unknown): unknown {
  if (typeof json !== "object" || json === null) return json;
  const trip = json as Record<string, unknown>;
  const { cities, legs } = trip;
  if (!Array.isArray(cities) || !Array.isArray(legs)) return json;
  if (cities.length <= GUEST_MAX_CITIES) return json;

  const existing = Array.isArray(trip.suggestedExtra) ? trip.suggestedExtra : [];
  const dropped = cities
    .slice(GUEST_MAX_CITIES)
    .map((city) => (city as { name?: unknown } | null)?.name)
    .filter(
      (name): name is string =>
        typeof name === "string" && name.length > 0 && name.length <= MAX_EXTRA_NAME,
    );
  return {
    ...trip,
    cities: cities.slice(0, GUEST_MAX_CITIES),
    legs: legs.slice(0, GUEST_MAX_CITIES - 1),
    suggestedExtra: [...new Set([...existing, ...dropped])].slice(0, MAX_EXTRA),
  };
}

export type AiTrip = z.infer<typeof AiTripSchema>;
