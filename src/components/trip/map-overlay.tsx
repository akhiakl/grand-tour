"use client";

import L from "leaflet";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Positioned HTML over the map (controls, legend). Clicks, drags and wheel
 * events stay with the overlay instead of panning or zooming the map.
 */
export function MapOverlay({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    L.DomEvent.disableClickPropagation(ref.current);
    L.DomEvent.disableScrollPropagation(ref.current);
  }, []);

  return (
    <div ref={ref} className={cn("absolute z-[1000]", className)}>
      {children}
    </div>
  );
}
