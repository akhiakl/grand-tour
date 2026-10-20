import { tripFileSlug, tripIcs, type Trip } from "@/lib/trip";

/** Save a dated trip's stops as an `.ics` file the calendar app opens. */
export function downloadTripCalendar(trip: Trip): void {
  const ics = tripIcs(trip);
  if (!ics) return;
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${tripFileSlug(trip.title)}.ics`;
  anchor.click();
  // Let the click start the download before the URL goes away.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
