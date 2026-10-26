import type { Trip } from "./schema";

const escapeXml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * A GPX 1.1 file: a waypoint per stop plus one route through them in order.
 * shortcut: GPX only (straight stop-to-stop route), KML deferred until asked.
 */
export function tripGpx(trip: Trip): string {
  const point = (tag: string, city: Trip["cities"][number]) =>
    `<${tag} lat="${city.ll[0]}" lon="${city.ll[1]}"><name>${escapeXml(city.name)}</name></${tag}>`;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="Grand Tour" xmlns="http://www.topografix.com/GPX/1/1">',
    `<metadata><name>${escapeXml(trip.title)}</name></metadata>`,
    ...trip.cities.map((c) => point("wpt", c)),
    `<rte><name>${escapeXml(trip.title)}</name>`,
    ...trip.cities.map((c) => point("rtept", c)),
    "</rte>",
    "</gpx>",
    "",
  ].join("\n");
}
