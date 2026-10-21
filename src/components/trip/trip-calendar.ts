import { downloadFile } from "@/components/download-file";
import { tripFileSlug, tripIcs, type Trip } from "@/lib/trip";

/** Save a dated trip's stops as an `.ics` file the calendar app opens. */
export function downloadTripCalendar(trip: Trip): void {
  const ics = tripIcs(trip);
  if (ics) downloadFile(`${tripFileSlug(trip.title)}.ics`, ics, "text/calendar");
}
