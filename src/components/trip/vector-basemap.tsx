"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

import "./maplibre";

import { MAP_STYLE } from "./map-style";

/**
 * OpenFreeMap vector basemap rendered by MapLibre inside Leaflet's tile
 * pane, so the `--map-filter` theming and Leaflet overlays keep working.
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
    return () => {
      map.attributionControl?.removeAttribution(MAP_STYLE.attribution);
      layer.remove();
    };
  }, [map]);

  return null;
}
