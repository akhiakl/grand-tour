import type { Trip } from "./schema";

/** One stop's stay, as calendar days (YYYY-MM-DD); `depart` is checkout day. */
export interface StopDates {
  arrive: string;
  depart: string;
}

const DAY_MS = 86_400_000;

/** Parse a YYYY-MM-DD day as UTC midnight, so no timezone can shift it. */
const toUtc = (day: string) => Date.parse(`${day}T00:00:00Z`);
const toDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Calendar days for every stop, by cumulative nights; null when undated. */
export function stopDates(trip: Trip): StopDates[] | null {
  if (!trip.startDate) return null;
  let cursor = toUtc(trip.startDate);
  return trip.cities.map((city) => {
    const arrive = toDay(cursor);
    cursor += city.nights * DAY_MS;
    return { arrive, depart: toDay(cursor) };
  });
}

/** The whole trip's first and last day; null when undated. */
export function tripDateRange(trip: Trip): StopDates | null {
  const dates = stopDates(trip);
  if (!dates) return null;
  return { arrive: dates[0].arrive, depart: dates.at(-1)!.depart };
}

const dayFormat = (locale: string) =>
  new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/** "May 1", or "May 1 – 4" / "May 30 – Jun 2" for a span (in `locale`). */
export function formatDateSpan(
  { arrive, depart }: StopDates,
  locale = "en",
): string {
  const format = dayFormat(locale);
  if (arrive === depart) return format.format(toUtc(arrive));
  return format.formatRange(toUtc(arrive), toUtc(depart));
}
