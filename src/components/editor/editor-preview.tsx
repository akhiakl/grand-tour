"use client";

import { MapPin } from "lucide-react";

import { TripMap } from "@/components/trip/trip-map";
import type { Trip } from "@/lib/trip";

export function EditorPreview({ trip }: { readonly trip: Trip }) {
  if (trip.cities.length === 0) {
    return (
      <div className="frost relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-[inherit] text-center">
        <MapPin aria-hidden className="size-6 text-muted-foreground" />
        <p className="max-w-50 text-sm text-muted-foreground">
          Add your first city to see the route take shape
        </p>
      </div>
    );
  }

  return <TripMap trip={trip} selectedIndex={null} onCitySelect={() => undefined} />;
}
