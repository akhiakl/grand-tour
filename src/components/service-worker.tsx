"use client";

import { useEffect } from "react";

import { MAP_STYLE } from "@/components/trip/map-style";

/**
 * Registers `public/sw.js` (offline copies of opened maps) in production.
 * The basemap's origin is passed along so the worker caches its tiles.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const tiles = new URL(MAP_STYLE.url).origin;
    navigator.serviceWorker
      .register(`/sw.js?tiles=${encodeURIComponent(tiles)}`, { scope: "/" })
      .catch(() => undefined);
  }, []);
  return null;
}
