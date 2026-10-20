"use client";

import { useReducedMotion } from "framer-motion";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import type { City, LatLng } from "@/lib/trip";

import { clearPanOffset, fitPadding, type MapInsets } from "./fit-padding";

const CITY_ZOOM = 9;

/** Fits the route, fences panning, and flies to the selected stop. */
export function MapFocus({
  cities,
  selectedIndex,
  bounds,
  insets,
}: {
  readonly cities: City[];
  readonly selectedIndex: number | null;
  readonly bounds: L.LatLngBounds;
  readonly insets: MapInsets;
}) {
  const map = useMap();
  const { top = 0, bottom = 0, left = 0 } = insets;

  useEffect(() => {
    // Fence panning one screen beyond the route (measured at the minimum
    // zoom), so a fit can always slide the route clear of the atlas card
    // while the route can never be dragged out of reach.
    const fence = () => {
      const zoom = map.getMinZoom();
      const { x, y } = map.getSize();
      const sw = map.project(bounds.getSouthWest(), zoom).add([-x, y]);
      const ne = map.project(bounds.getNorthEast(), zoom).add([x, -y]);
      map.setMaxBounds(
        L.latLngBounds(map.unproject(sw, zoom), map.unproject(ne, zoom)),
      );
    };
    fence();
    map.on("resize", fence);
    return () => {
      map.off("resize", fence);
    };
  }, [map, bounds]);

  useEffect(() => {
    // MapContainer only applies `style` on mount, so set the insets the
    // overlays (legend, attribution) offset by on the live container.
    const container = map.getContainer();
    container.style.setProperty("--map-inset-bottom", `${bottom}px`);
    container.style.setProperty("--map-inset-left", `${left}px`);
  }, [map, bottom, left]);

  useEffect(() => {
    if (selectedIndex === null) {
      map.flyToBounds(bounds, {
        ...fitPadding({ top, bottom, left }, map.getSize().y),
        duration: 1,
      });
    } else {
      // Centre the stop in the part of the map the card leaves visible.
      const point = map
        .project(cities[selectedIndex].ll as LatLng, CITY_ZOOM)
        .add([-left / 2, (bottom - top) / 2]);
      map.flyTo(map.unproject(point, CITY_ZOOM), CITY_ZOOM, { duration: 1.2 });
    }
  }, [map, bounds, cities, selectedIndex, top, bottom, left]);

  return null;
}

/**
 * Keeps a keyboard-focused stop visible (WCAG 2.4.11): when Tab lands on
 * a marker the atlas card covers, pans the map just enough to bring it
 * into the clear area. Replaces Leaflet's own `autoPanOnFocus`, which
 * only knows the map's edges, not the card.
 */
export function MarkerFocusPan({ insets }: { readonly insets: MapInsets }) {
  const map = useMap();
  const reducedMotion = useReducedMotion();
  const latest = useRef({ insets, reducedMotion });

  useEffect(() => {
    latest.current = { insets, reducedMotion };
  }, [insets, reducedMotion]);

  useEffect(() => {
    const pane = map.getPane("markerPane");
    if (!pane) return;
    const onFocusIn = (event: FocusEvent) => {
      const icon = (event.target as Element).closest?.<HTMLElement>(
        ".leaflet-marker-icon",
      );
      if (!icon) return;
      // Icons are 0×0 at their stop, so the icon's position is the stop's.
      const point = map.layerPointToContainerPoint(L.DomUtil.getPosition(icon));
      const [dx, dy] = clearPanOffset(point, latest.current.insets, map.getSize());
      if (dx !== 0 || dy !== 0) {
        map.panBy([dx, dy], { animate: !latest.current.reducedMotion });
      }
    };
    pane.addEventListener("focusin", onFocusIn);
    return () => pane.removeEventListener("focusin", onFocusIn);
  }, [map]);

  return null;
}
