import { stopDates } from "./dates";
import { tripFingerprint } from "./fingerprint";
import type { Trip } from "./schema";

/** RFC 5545 TEXT escaping: backslash, semicolon, comma and newlines. */
const escapeText = (text: string) =>
  text
    .replaceAll("\\", String.raw`\\`)
    .replaceAll(";", String.raw`\;`)
    .replaceAll(",", String.raw`\,`)
    .replaceAll(/\r?\n/g, String.raw`\n`);

/** Fold content lines longer than 75 octets (RFC 5545 §3.1). */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const charSize = new TextEncoder().encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (size + charSize > limit) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += charSize;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const compactDay = (day: string) => day.replaceAll("-", "");

const nextDay = (day: string) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

const stamp = (ms: number) =>
  new Date(ms)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/**
 * An iCalendar file with one all-day event per stop (arrival day through
 * checkout), for dated trips; null when the trip has no start date.
 */
export function tripIcs(trip: Trip, now: number = Date.now()): string | null {
  const dates = stopDates(trip);
  if (!dates) return null;
  const uidBase = tripFingerprint(trip);

  const events = trip.cities.flatMap((city, index) => {
    const { arrive, depart } = dates[index];
    return [
      "BEGIN:VEVENT",
      `UID:${uidBase}-${index}@grand-tour`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${compactDay(arrive)}`,
      // All-day DTEND is exclusive; a zero-night stop still gets its day.
      `DTEND;VALUE=DATE:${compactDay(arrive === depart ? nextDay(arrive) : depart)}`,
      `SUMMARY:${escapeText(city.name + " · " + trip.title)}`,
      `LOCATION:${escapeText([city.name, city.country].filter(Boolean).join(", "))}`,
      ...(city.why ? [`DESCRIPTION:${escapeText(city.why)}`] : []),
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    ];
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grand Tour//Route map//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(trip.title)}`,
    ...events,
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n")
    .concat("\r\n");
}
