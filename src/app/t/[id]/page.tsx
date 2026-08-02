import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { TripExperience } from "@/components/trip/trip-experience";
import { tripStats } from "@/lib/trip";
import { getTrip, incrViews } from "@/lib/trip/service";

type Params = { id: string };

// generateMetadata and the page component both need the trip; React's
// per-request cache dedupes the underlying GETEX to a single Redis call.
const loadTrip = cache((id: string) => getTrip(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const trip = await loadTrip(id);
  if (!trip) return { title: "Map not found" };

  const stats = tripStats(trip);
  return {
    title: trip.title,
    description: `${stats.cities} cities · ${stats.nights} nights · ${stats.countries} countries — a route drawn with Grand Tour.`,
  };
}

export default async function SharedTripPage({
  params,
}: {
  readonly params: Promise<Params>;
}) {
  const { id } = await params;
  const trip = await loadTrip(id);
  if (!trip) notFound();

  await incrViews(id);

  return <TripExperience trip={trip} actions="shared" />;
}
