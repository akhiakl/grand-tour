"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { toast } from "sonner";

import "./maplibre";

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
      // A shared id keeps a burst of tile errors down to one toast.
      toast.error("The basemap is out of reach. Your route is still here.", {
        id: OFFLINE_TOAST_ID,
        action: {
          label: "Retry",
          onClick: () => basemap.setStyle(MAP_STYLE.url),
        },
      });
    };
    basemap.on("error", onError);

    return () => {
      basemap.off("error", onError);
      toast.dismiss(OFFLINE_TOAST_ID);
      map.attributionControl?.removeAttribution(MAP_STYLE.attribution);
      layer.remove();
    };
  }, [map]);

  return null;
}
