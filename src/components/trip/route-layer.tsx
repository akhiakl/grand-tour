"use client";

import { useReducedMotion } from "framer-motion";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { Marker, Polyline } from "react-leaflet";

import { arcPoints, routePath, type LatLng, type Leg, type Trip } from "@/lib/trip";

import { INTRO_HOLD_MS } from "./intro-splash";
import { MODE_META } from "./mode";

const ARC_SEGMENTS = 20;

function badgeIcon(leg: Leg) {
  const { emoji, label } = MODE_META[leg.mode];
  return L.divIcon({
    className: "marker-anchor",
    html: `<span class="leg-badge" role="img" aria-label="${label}, ${leg.duration}">${emoji}</span>`,
    iconSize: [34, 22],
    iconAnchor: [17, 11],
  });
}

/**
 * The curved brass route, traced point-by-point once the intro splash
 * lifts; transport badges land on each arc's midpoint after the draw.
 */
export function RouteLayer({ trip }: { trip: Trip }) {
  const reducedMotion = useReducedMotion();
  const stops = useMemo(
    () => trip.cities.map((city) => city.ll as LatLng),
    [trip.cities],
  );
  const path = useMemo(() => routePath(stops, ARC_SEGMENTS), [stops]);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    // Reduced motion renders the full path directly — nothing to animate.
    if (reducedMotion) return;
    let count = 0;
    let frame = 0;
    const start = performance.now() + INTRO_HOLD_MS;
    const tick = (now: number) => {
      if (now >= start) {
        count = Math.min(count + 1, path.length);
        setVisible(count);
      }
      if (count < path.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [path, reducedMotion]);

  const shown = reducedMotion ? path : path.slice(0, visible);
  const drawn = reducedMotion || visible >= path.length;

  const badges = useMemo(
    () =>
      trip.legs.map((leg, i) => ({
        leg,
        position: arcPoints(stops[i], stops[i + 1], 2)[1],
      })),
    [trip.legs, stops],
  );

  return (
    <>
      <Polyline positions={shown} pathOptions={{ weight: 2.5 }} />
      {drawn &&
        badges.map(({ leg, position }, i) => (
          <Marker
            key={`${leg.label}-${i}`}
            position={position}
            icon={badgeIcon(leg)}
            interactive={false}
          />
        ))}
    </>
  );
}
