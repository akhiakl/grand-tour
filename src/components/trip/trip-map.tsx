"use client";

import dynamic from "next/dynamic";

import { usePageIdle } from "@/hooks/use-page-idle";

import type { TripMapProps } from "./map-canvas";

// Leaflet touches `window` at import time — client-only, with a sized
// fallback so the layout never shifts while the map chunk loads.
const placeholder = (
  <div
    aria-hidden
    className="h-full w-full animate-pulse rounded-[inherit] bg-muted"
  />
);

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => placeholder,
});

/**
 * Expects a positioned, sized parent (the map frame): the canvas fills it
 * absolutely because percentage heights can't resolve against flex sizing.
 */
export function TripMap(props: TripMapProps) {
  // The map engine is the heaviest script on the page: fetch it once the
  // page is idle so text and controls paint and respond first.
  const idle = usePageIdle();
  return (
    <div className="absolute inset-0">
      {idle ? <MapCanvas {...props} /> : placeholder}
    </div>
  );
}
