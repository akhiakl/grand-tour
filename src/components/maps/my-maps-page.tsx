"use client";

import { Compass, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteLocalTrip, listLocalTrips } from "@/lib/trip";

import { TripCard } from "./trip-card";

const emptySubscribe = () => () => {};

function MapsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="frost flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
      <Compass aria-hidden className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        No maps yet — every trip you build sticks around in this browser.
      </p>
      <Button asChild variant="brass">
        <Link href="/new">
          <Plus /> Start a route
        </Link>
      </Button>
    </div>
  );
}

export function MyMapsPage() {
  // True after hydration only — local trips live in localStorage, unknowable during SSR.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [version, setVersion] = useState(0);
  const trips = useMemo(
    () => (mounted ? listLocalTrips() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` forces a re-read after delete
    [mounted, version],
  );

  const handleDelete = (id: string) => {
    deleteLocalTrip(id);
    setVersion((current) => current + 1);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium">My Maps</h1>
        <Button asChild variant="brass">
          <Link href="/new">
            <Plus /> New route
          </Link>
        </Button>
      </div>

      {!mounted && <MapsSkeleton />}
      {mounted && trips.length === 0 && <EmptyState />}
      {mounted && trips.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((entry) => (
            <TripCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
