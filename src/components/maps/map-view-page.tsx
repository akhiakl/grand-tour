"use client";

import { useParams } from "next/navigation";

import { OffTheMap } from "@/components/off-the-map";
import { TripExperience } from "@/components/trip/trip-experience";
import { useMounted } from "@/hooks/use-mounted";
import { getLocalTrip } from "@/lib/trip";

function NotFoundOnThisDevice() {
  return (
    <OffTheMap
      title="Not on this device"
      action={{ href: "/maps", label: "Back to My Maps" }}
    >
      Local maps live in this browser only. If you saved it somewhere else, open it
      from there, or start a new one here.
    </OffTheMap>
  );
}

/**
 * Map View — the immersive, read-only-ish experience for one of *your*
 * saved local maps (`/maps/[id]`). Entirely client-driven: local trips
 * only exist in this browser's localStorage, so there's no server data
 * to fetch. Distinct from the Shared View (`/t/[id]`), which reads a
 * public Redis snapshot instead.
 */
export function MapViewPage() {
  const { id } = useParams<{ id: string }>();
  const mounted = useMounted();

  if (!mounted) return null;

  const record = getLocalTrip(id);
  if (!record) return <NotFoundOnThisDevice />;

  return <TripExperience trip={record.trip} actions="own" localId={record.id} />;
}
