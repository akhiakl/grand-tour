import { z } from "zod";

/** Maximum stops a guest trip may contain (Phase 2 lifts this for accounts). */
export const GUEST_MAX_CITIES = 5;

/** Hard cap for any trip payload accepted by the API. */
export const MAX_TRIP_PAYLOAD_BYTES = 50 * 1024;

/** Every trip starts life named after the app itself. */
export const DEFAULT_TRIP_TITLE = "Grand Tour";

export const CitySchema = z.object({
  name: z.string().max(60),
  country: z.string().max(60),
  flag: z.string().max(8), // emoji
  ll: z.tuple([z.number(), z.number()]),
  nights: z.number().int().min(0).max(30),
  why: z.string().max(500),
  must: z.array(z.string().max(80)).max(10),
  gems: z.array(z.string().max(80)).max(6),
  food: z.array(z.tuple([z.string().max(60), z.string().max(120)])).max(6),
  days: z
    .array(z.tuple([z.string().max(20), z.string().max(60), z.string().max(300)]))
    .max(10),
  budget: z.tuple([z.number(), z.number()]), // €/day range
  transport: z.string().max(120),
  stay: z.string().max(300),
  tips: z.array(z.string().max(200)).max(6),
});

export const LegSchema = z.object({
  mode: z.enum(["train", "bus", "flight", "car", "ferry"]),
  label: z.string().max(80), // e.g. "Railjet via Villach"
  duration: z.string().max(20), // "~4h 45m"
});

export const TripSchema = z
  .object({
    v: z.literal(1),
    title: z.string().min(1).max(80),
    cities: z.array(CitySchema).min(2).max(GUEST_MAX_CITIES),
    legs: z.array(LegSchema),
    createdBy: z.enum(["guest", "user"]).default("guest"),
    createdAt: z.number(),
  })
  .refine((trip) => trip.legs.length === trip.cities.length - 1, {
    message:
      "legs must connect consecutive cities (legs.length === cities.length - 1)",
    path: ["legs"],
  });

export type City = z.infer<typeof CitySchema>;
export type Leg = z.infer<typeof LegSchema>;
export type Trip = z.infer<typeof TripSchema>;
