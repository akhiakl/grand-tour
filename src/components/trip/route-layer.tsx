"use client";

import { useReducedMotion } from "framer-motion";
import L from "leaflet";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { Marker, Polyline } from "react-leaflet";

import { legMidpoint, type LatLng, type Leg, type Trip } from "@/lib/trip";

import { MODE_META } from "./mode";

const LEG_DRAW_SECONDS = 0.9;

/**
 * One leg of the brass route, drawn with an SVG pathLength animation.
 * Legs are staggered so the route traces city-to-city in order.
 */
function AnimatedLeg({
  from,
  to,
  delaySeconds,
}: {
  from: LatLng;
  to: LatLng;
  delaySeconds: number;
}) {
  const ref = useRef<L.Polyline>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const path = ref.current?.getElement() as SVGPathElement | undefined;
    if (!path || reducedMotion) return;

    path.setAttribute("pathLength", "1");
    path.style.strokeDasharray = "1";
    path.style.strokeDashoffset = "1";

    const frame = requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${LEG_DRAW_SECONDS}s var(--ease-atlas) ${delaySeconds}s`;
      path.style.strokeDashoffset = "0";
    });
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, delaySeconds]);

  return (
    <Polyline
      ref={ref}
      positions={[from, to]}
      pathOptions={{ className: "route-leg", weight: 3 }}
    />
  );
}

function useBadgeIcon(leg: Leg) {
  return useMemo(() => {
    const { emoji, label } = MODE_META[leg.mode];
    return L.divIcon({
      className: "leg-badge-anchor",
      html: `<span class="leg-badge" role="img" aria-label="${label}, ${leg.duration}">${emoji}</span>`,
      iconSize: [34, 22],
      iconAnchor: [17, 11],
    });
  }, [leg]);
}

function LegBadge({ leg, position }: { leg: Leg; position: LatLng }) {
  const icon = useBadgeIcon(leg);
  return <Marker position={position} icon={icon} interactive={false} />;
}

export function RouteLayer({ trip }: { trip: Trip }) {
  return (
    <>
      {trip.legs.map((leg, index) => {
        const from = trip.cities[index].ll as LatLng;
        const to = trip.cities[index + 1].ll as LatLng;
        return (
          <Fragment key={`${leg.label}-${index}`}>
            <AnimatedLeg
              from={from}
              to={to}
              delaySeconds={index * LEG_DRAW_SECONDS}
            />
            <LegBadge leg={leg} position={legMidpoint(from, to)} />
          </Fragment>
        );
      })}
    </>
  );
}
