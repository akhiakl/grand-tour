"use client";

import L from "leaflet";
import { useMemo } from "react";
import { Marker } from "react-leaflet";

import type { GhostStop } from "@/lib/ai";
import { escapeHtml } from "@/lib/utils";

const LOCK_SVG =
  '<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

function GhostMarker({
  ghost,
  onSelect,
}: {
  readonly ghost: GhostStop;
  readonly onSelect: () => void;
}) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "marker-anchor",
        html: `<div class="marker marker-ghost"><span class="marker-dot"></span><span class="marker-lbl">${LOCK_SVG} ${escapeHtml(ghost.name)}</span></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
    [ghost.name],
  );

  return (
    <Marker
      position={ghost.ll}
      icon={icon}
      title={`${ghost.name}, locked suggestion`}
      autoPanOnFocus={false}
      eventHandlers={{ click: onSelect }}
    />
  );
}

/** Locked AI suggestions past the guest limit; any of them opens the upsell. */
export function GhostMarkers({
  ghosts,
  onSelect,
}: {
  readonly ghosts: readonly GhostStop[];
  readonly onSelect: () => void;
}) {
  return ghosts.map((ghost, index) => (
    <GhostMarker key={`${ghost.name}-${index}`} ghost={ghost} onSelect={onSelect} />
  ));
}
