import type { City } from "@/lib/trip";

import type { GenerateRequest } from "./schema";

const MIN_DAYS = 2;
const MAX_DAYS = 30;
const MAX_DESTINATION = 120;

/**
 * Starting answers for redrafting a trip with the AI: the original chat
 * answers when the editor still has them, otherwise derived from the
 * draft itself (its stops as the destination, nights + 1 as the days).
 */
export function redraftDefaults(
  draft: { readonly title: string; readonly cities: readonly City[] },
  previous?: GenerateRequest,
): GenerateRequest {
  if (previous) return previous;
  const nights = draft.cities.reduce((sum, city) => sum + city.nights, 0);
  const stops = draft.cities.map((city) => city.name.trim()).filter(Boolean);
  const destination = (stops.length ? stops.join(", ") : draft.title).slice(
    0,
    MAX_DESTINATION,
  );
  return {
    destination,
    days: Math.min(MAX_DAYS, Math.max(MIN_DAYS, nights + 1)),
    vibe: "balanced",
  };
}
