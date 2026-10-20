import { PLUG_TYPES } from "./plug-types";
import type { Leg, Trip } from "./schema";

/** Always worth packing, wherever the route goes. */
const ESSENTIALS = [
  "Passport & ID",
  "Travel insurance details",
  "Comfortable walking shoes",
  "Power bank",
  "Refillable water bottle",
  "Day pack",
  "Light rain layer",
];

const MODE_ITEMS: Record<Leg["mode"], string> = {
  train: "Rail tickets saved offline",
  bus: "Bus tickets saved offline",
  flight: "Boarding passes & a clear liquids bag",
  ferry: "Ferry booking & a motion-sickness remedy",
  car: "Driving licence (and an international permit if needed)",
};

/** A week or more on the road earns a laundry kit. */
const LAUNDRY_NIGHTS = 7;

const listFormat = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

/**
 * One adapter line per distinct socket set on the route, naming the
 * countries it covers; countries without a known socket type share a
 * universal-adapter line.
 */
function adapterItems(trip: Trip): string[] {
  const byType = new Map<string, string[]>();
  const unknown: string[] = [];

  for (const country of new Set(trip.cities.map((city) => city.country.trim()))) {
    if (!country) continue;
    const type = PLUG_TYPES[country.toLowerCase()];
    if (type) byType.set(type, [...(byType.get(type) ?? []), country]);
    else unknown.push(country);
  }

  const items = [...byType].map(
    ([type, countries]) =>
      `Power adapter for type ${type} sockets (${listFormat.format(countries)})`,
  );
  if (unknown.length > 0 || items.length === 0) {
    items.push("Universal travel adapter");
  }
  return items;
}

/**
 * A packing checklist shaped by the trip itself: essentials, the socket
 * adapters its countries need, tickets for the ways it travels, and a
 * laundry kit for longer routes. Labels double as stable checklist keys.
 */
export function packingList(trip: Trip): string[] {
  const modes = [...new Set(trip.legs.map((leg) => leg.mode))];
  const nights = trip.cities.reduce((sum, city) => sum + city.nights, 0);
  const countries = new Set(trip.cities.map((city) => city.country)).size;

  return [
    ...ESSENTIALS,
    ...adapterItems(trip),
    ...modes.map((mode) => MODE_ITEMS[mode]),
    ...(countries > 1 ? ["A little local cash for each country"] : []),
    ...(nights >= LAUNDRY_NIGHTS ? ["Travel laundry kit"] : []),
  ];
}
