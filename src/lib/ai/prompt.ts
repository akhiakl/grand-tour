import { GUEST_MAX_CITIES } from "@/lib/schema";
import type { GenerateRequest } from "./schema";

/** JSON shape shown to the model — kept in sync with AiTripSchema. */
const TRIP_JSON_SHAPE = `{
  "title": "string, 1-80 chars, evocative route name",
  "cities": [
    {
      "name": "string ≤60", "country": "string ≤60", "flag": "emoji ≤8",
      "ll": [latitude, longitude],
      "nights": "integer 0-30",
      "why": "string ≤500 — why this stop earns its place",
      "must": ["≤10 strings ≤80 — real headline sights"],
      "gems": ["≤6 strings ≤80 — real lesser-known finds"],
      "food": [["dish ≤60", "where/why ≤120"], "… ≤6 pairs"],
      "days": [["Day 1", "theme ≤60", "plan ≤300"], "… ≤10 triples"],
      "budget": [minPerDayEUR, maxPerDayEUR],
      "transport": "string ≤120 — getting around this city",
      "stay": "string ≤300 — neighbourhood advice",
      "tips": ["≤6 strings ≤200"]
    }
  ],
  "legs": [
    {
      "mode": "train | bus | flight | car | ferry",
      "label": "string ≤80, e.g. 'Railjet via Villach'",
      "duration": "string ≤20, e.g. '~4h 45m'"
    }
  ],
  "suggestedExtra": ["≤10 city names ≤60 that did not fit the ${GUEST_MAX_CITIES}-city limit"]
}`;

export function buildSystemPrompt(): string {
  return [
    "You are the route planner behind Grand Tour, a travel route map service.",
    "Respond with ONE JSON object only — no markdown, no commentary — matching exactly this shape:",
    TRIP_JSON_SHAPE,
    "Hard rules:",
    `- At most ${GUEST_MAX_CITIES} cities. If the request implies more, pick the best ${GUEST_MAX_CITIES} and put the remaining city names in suggestedExtra (empty array otherwise).`,
    "- Order cities in a realistic geographic route with minimal backtracking.",
    "- Use real coordinates as [latitude, longitude] with 4 decimal places.",
    "- legs.length must equal cities.length - 1; each leg connects consecutive cities with a realistic mode and duration.",
    "- Only real, verifiable attractions, restaurants and neighbourhoods — never invent places.",
    "- budget is a €/day [min, max] range for a mid-range traveller.",
    "- Total nights across cities should match the requested trip length.",
  ].join("\n");
}

export function buildUserPrompt(request: GenerateRequest): string {
  const pace = {
    relaxed: "relaxed — fewer stops, more nights each, unhurried days",
    balanced: "balanced — a steady mix of sightseeing and downtime",
    packed: "packed — maximise sights, faster pace, efficient days",
  }[request.vibe];

  return [
    `Destination or region: ${request.destination}`,
    `Trip length: ${request.days} days`,
    `Pace: ${pace}`,
  ].join("\n");
}

export function buildRetryPrompt(issues: string): string {
  return [
    "Your previous JSON failed validation with these errors:",
    issues,
    "Return the corrected JSON object only, same shape, fixing every error.",
  ].join("\n");
}
