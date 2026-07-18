"use client";

import dynamic from "next/dynamic";

import type { TripMapProps } from "./map-canvas";

// Leaflet touches `window` at import time — client-only, with a sized
// fallback so the layout never shifts while the map chunk loads.
const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="h-full w-full animate-pulse rounded-[inherit] bg-muted"
    />
  ),
});

/**
 * Expects a positioned, sized parent (the map frame): the canvas fills it
 * absolutely because percentage heights can't resolve against flex sizing.
 */
export function TripMap(props: TripMapProps) {
  return (
    <div className="absolute inset-0">
      <MapCanvas {...props} />
    </div>
  );
}
