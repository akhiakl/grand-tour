"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import L from "leaflet";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { toast } from "sonner";

import "./maplibre";

import { quietBasemap } from "./basemap-tweaks";
import { MAP_STYLE, RASTER_FALLBACK } from "./map-style";

const OFFLINE_TOAST_ID = "basemap-offline";

/**
 * OpenFreeMap vector basemap rendered by MapLibre inside Leaflet's tile
 * pane, so the `--map-filter` theming and Leaflet overlays keep working.
 * When the style or tiles can't load, the paper background stays and one
 * toast offers a retry; the route and markers keep working regardless.
 * When MapLibre can't start at all (no WebGL2), raster tiles take over.
 */
export function VectorBasemap() {
  const map = useMap();
  const t = useTranslations("Trip.map");
  const downMessage = t("basemapDown");
  const retryLabel = t("retry");

  useEffect(() => {
    const layer = maplibreGL({
      style: MAP_STYLE.url,
      attributionControl: false,
    });
    let started = true;
    try {
      layer.addTo(map);
    } catch {
      started = false;
    }

    const basemap = started ? layer.getMaplibreMap() : undefined;
    if (!basemap) {
      // MapLibre couldn't start (e.g. no WebGL2). Leaflet already registered
      // the layer, and its stock onRemove would call `remove()` on the
      // missing MapLibre map when the map is torn down, so swap in a safe
      // one and unregister it. Raster tiles stand in for the basemap.
      const broken = layer as unknown as {
        _container?: HTMLElement;
        onRemove: () => void;
      };
      broken.onRemove = () => {
        broken._container?.remove();
      };
      map.removeLayer(layer);
      const raster = L.tileLayer(RASTER_FALLBACK.url, {
        subdomains: RASTER_FALLBACK.subdomains,
        attribution: RASTER_FALLBACK.attribution,
        detectRetina: true,
        maxZoom: 12,
      }).addTo(map);
      return () => {
        raster.remove();
      };
    }

    map.attributionControl?.addAttribution(MAP_STYLE.attribution);
    const onError = () => {
      // Once the style is up, errors are per-tile hiccups the map rides
      // out on its own; only a style that never arrived means an outage.
      if (basemap.isStyleLoaded()) return;
      toast.error(downMessage, {
        id: OFFLINE_TOAST_ID,
        // Stays until the style loads (after Retry) or the map unmounts.
        duration: Infinity,
        action: {
          label: retryLabel,
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
  }, [map, downMessage, retryLabel]);

  return null;
}
