import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

import { TripExperience } from "@/components/trip/trip-experience";
import { emit } from "@/lib/logging";
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
  const t = await getTranslations("Metadata.shared");
  // Shared maps are private-by-link: unfurl them, never index them.
  if (!trip) return { title: t("notFound"), robots: { index: false } };

  const stats = tripStats(trip);
  return {
    title: trip.title,
    description: t("description", {
      cities: stats.cities,
      nights: stats.nights,
      countries: stats.countries,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function SharedTripPage({
  params,
}: {
  readonly params: Promise<Params>;
}) {
  const { id } = await params;
  const trip = await loadTrip(id);
  if (!trip) {
    emit("warn", "trip not found", { route: "/t/[id]", status: 404 });
    notFound();
  }

  const views = await incrViews(id);
  emit("info", "trip viewed", { route: "/t/[id]" });

  return <TripExperience trip={trip} actions="shared" shareId={id} views={views} />;
}
