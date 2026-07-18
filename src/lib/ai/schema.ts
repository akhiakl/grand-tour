import { z } from "zod";

import { CitySchema, GUEST_MAX_CITIES, LegSchema } from "@/lib/schema";

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

export type AiTrip = z.infer<typeof AiTripSchema>;
