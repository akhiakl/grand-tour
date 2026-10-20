"use client";

import type { LatLngBounds } from "leaflet";
import { Maximize, Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useMap } from "react-leaflet";

import { fitPadding } from "./fit-padding";
import { MapOverlay } from "./map-overlay";

function ControlButton({
  label,
  onClick,
  children,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-9 place-items-center text-ink transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

/** Zoom and "fit route": the only controls floating on the map. */
export function MapControls({
  bounds,
  bottomInset,
}: {
  readonly bounds: LatLngBounds;
  readonly bottomInset: number;
}) {
  const map = useMap();

  return (
    <MapOverlay className="top-3 right-3 flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-card-solid shadow-soft">
      <ControlButton label="Zoom in" onClick={() => map.zoomIn()}>
        <Plus />
      </ControlButton>
      <ControlButton label="Zoom out" onClick={() => map.zoomOut()}>
        <Minus />
      </ControlButton>
      <ControlButton
        label="Fit the whole route"
        onClick={() =>
          map.flyToBounds(bounds, {
            ...fitPadding(bottomInset, map.getSize().y),
            duration: 0.8,
          })
        }
      >
        <Maximize />
      </ControlButton>
    </MapOverlay>
  );
}
