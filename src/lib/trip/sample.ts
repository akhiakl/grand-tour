import raw from "./sample-trip.json";
import { TripSchema, type Trip } from "./schema";

/**
 * The demo trip shown on the landing map — validated at module load so the
 * sample can never drift from the schema.
 */
export const SAMPLE_TRIP: Trip = TripSchema.parse(raw);
