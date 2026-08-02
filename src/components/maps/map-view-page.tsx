"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { TripExperience } from "@/components/trip/trip-experience";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { getLocalTrip } from "@/lib/trip";

function NotFoundOnThisDevice() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Compass className="size-10 text-muted-foreground" />
        <p className="eyebrow">Off the map</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Not on this device
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Local maps live in this browser only. If you saved it somewhere else, open
          it from there — or start a new one here.
        </p>
        <Button asChild variant="brass" className="mt-2">
          <Link href="/maps">Back to My Maps</Link>
        </Button>
      </div>
    </div>
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
