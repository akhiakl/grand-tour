"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { toast } from "sonner";

import "./maplibre";

import { quietBasemap } from "./basemap-tweaks";
import { MAP_STYLE } from "./map-style";

const OFFLINE_TOAST_ID = "basemap-offline";

/**
 * OpenFreeMap vector basemap rendered by MapLibre inside Leaflet's tile
 * pane, so the `--map-filter` theming and Leaflet overlays keep working.
 * When the style or tiles can't load, the paper background stays and one
 * toast offers a retry; the route and markers keep working regardless.
 */
export function VectorBasemap() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: MAP_STYLE.url,
      attributionControl: false,
    });
    layer.addTo(map);
    map.attributionControl?.addAttribution(MAP_STYLE.attribution);

    const basemap = layer.getMaplibreMap();
    const onError = () => {
      // Once the style is up, errors are per-tile hiccups the map rides
      // out on its own; only a style that never arrived means an outage.
      if (basemap.isStyleLoaded()) return;
      toast.error("The basemap is out of reach. Your route is still here.", {
        id: OFFLINE_TOAST_ID,
        // Stays until the style loads (after Retry) or the map unmounts.
        duration: Infinity,
        action: {
          label: "Retry",
          onClick: () => basemap.setStyle(MAP_STYLE.url),
        },
      });
    };
    const onStyleLoad = () => {
      toast.dismiss(OFFLINE_TOAST_ID);
      quietBasemap(basemap);
    };
    basemap.on("error", onError);
    basemap.on("style.load", onStyleLoad);

    return () => {
      basemap.off("error", onError);
      basemap.off("style.load", onStyleLoad);
      toast.dismiss(OFFLINE_TOAST_ID);
      map.attributionControl?.removeAttribution(MAP_STYLE.attribution);
      layer.remove();
    };
  }, [map]);

  return null;
}
