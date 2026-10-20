import { PLUG_TYPES } from "./plug-types";
import type { Leg, Trip } from "./schema";

/** Message keys for packing items; the UI owns the wording. */
export type PackingKey =
  | "passport"
  | "insurance"
  | "shoes"
  | "powerBank"
  | "bottle"
  | "dayPack"
  | "rainLayer"
  | "adapter"
  | "universalAdapter"
  | Leg["mode"]
  | "cash"
  | "laundry";

/**
 * One suggested item. `id` is stable across visits (it keys the viewer's
 * saved ticks); `countries`/`type` fill the adapter line's message.
 */
export type PackingItem =
  | { id: string; key: Exclude<PackingKey, "adapter"> }
  | { id: string; key: "adapter"; type: string; countries: string[] };

/** Always worth packing, wherever the route goes. */
const ESSENTIALS = [
  "passport",
  "insurance",
  "shoes",
  "powerBank",
  "bottle",
  "dayPack",
  "rainLayer",
] as const;

/** A week or more on the road earns a laundry kit. */
const LAUNDRY_NIGHTS = 7;

const simple = (key: Exclude<PackingKey, "adapter">): PackingItem => ({
  id: key,
  key,
});

/**
 * One adapter line per distinct socket set on the route, naming the
 * countries it covers; countries without a known socket type share a
 * universal-adapter line.
 */
function adapterItems(trip: Trip): PackingItem[] {
  const byType = new Map<string, string[]>();
  let unknown = false;

  for (const country of new Set(trip.cities.map((city) => city.country.trim()))) {
    if (!country) continue;
    const type = PLUG_TYPES[country.toLowerCase()];
    if (type) byType.set(type, [...(byType.get(type) ?? []), country]);
    else unknown = true;
  }

  const items: PackingItem[] = [...byType].map(([type, countries]) => ({
    id: `adapter:${type}`,
    key: "adapter",
    type,
    countries,
  }));
  if (unknown || items.length === 0) items.push(simple("universalAdapter"));
  return items;
}

/**
 * A packing checklist shaped by the trip itself: essentials, the socket
 * adapters its countries need, tickets for the ways it travels, and a
 * laundry kit for longer routes.
 */
export function packingList(trip: Trip): PackingItem[] {
  const modes = [...new Set(trip.legs.map((leg) => leg.mode))];
  const nights = trip.cities.reduce((sum, city) => sum + city.nights, 0);
  const countries = new Set(trip.cities.map((city) => city.country)).size;

  return [
    ...ESSENTIALS.map(simple),
    ...adapterItems(trip),
    ...modes.map(simple),
    ...(countries > 1 ? [simple("cash")] : []),
    ...(nights >= LAUNDRY_NIGHTS ? [simple("laundry")] : []),
  ];
}
