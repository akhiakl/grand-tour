"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, useMapEvents } from "react-leaflet";

import type { GhostStop } from "@/lib/ai";
import { routeBounds, type City, type LatLng, type Trip } from "@/lib/trip";
import { escapeHtml } from "@/lib/utils";

import type { MapInsets } from "./fit-padding";
import { GhostMarkers } from "./ghost-markers";
import { MapControls } from "./map-controls";
import { MapDeclutter } from "./map-declutter";
import { MapFocus, MarkerFocusPan } from "./map-focus";
import { MapLegend } from "./map-legend";
import { RouteLayer } from "./route-layer";
import { VectorBasemap } from "./vector-basemap";

export interface TripMapProps {
  readonly trip: Trip;
  readonly selectedIndex: number | null;
  readonly onCitySelect: (index: number) => void;
  /** A stop highlighted from elsewhere (its itinerary row is hovered). */
  readonly hoveredIndex?: number | null;
  /** The pointer entered (index) or left (null) a stop's marker. */
  readonly onCityHover?: (index: number | null) => void;
  /** Locked AI suggestions (editor only); selecting one opens the upsell. */
  readonly ghosts?: readonly GhostStop[];
  readonly onGhostSelect?: () => void;
  /** Pixels the atlas card covers; fits, focus pans and overlays clear it. */
  readonly insets?: MapInsets;
  /** A tap on the map itself (not a marker), e.g. to lower the sheet. */
  readonly onBackgroundClick?: () => void;
}

const NO_INSETS: MapInsets = {};

function BackgroundClick({ onClick }: { readonly onClick: () => void }) {
  useMapEvents({ click: onClick });
  return null;
}

function CityMarker({
  city,
  index,
  selected,
  hovered,
  onSelect,
  onHover,
}: {
  readonly city: City;
  readonly index: number;
  readonly selected: boolean;
  readonly hovered: boolean;
  readonly onSelect: (index: number) => void;
  readonly onHover?: (index: number | null) => void;
}) {
  const t = useTranslations("Trip.map");
  const marker = useRef<L.Marker>(null);
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "marker-anchor",
        html: `<div class="marker${selected ? " marker-active" : ""}">${selected ? '<span class="marker-pulse"></span>' : ""}<span class="marker-dot"></span><span class="marker-lbl">${escapeHtml(city.flag)} ${escapeHtml(city.name)}</span></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
    [city.flag, city.name, selected],
  );

  // Toggled on the live element rather than baked into the icon: swapping
  // the icon would replace the element under the pointer (and its focus).
  useEffect(() => {
    marker.current
      ?.getElement()
      ?.querySelector(".marker")
      ?.classList.toggle("marker-hover", hovered);
  }, [hovered, icon]);

  return (
    <Marker
      ref={marker}
      position={city.ll as LatLng}
      icon={icon}
      // Leaflet applies `alt` only to <img> icons; `title` names a divIcon
      // for screen readers and shows the full name over a truncated label.
      title={t("marker", { name: city.name, number: index + 1 })}
      autoPanOnFocus={false}
      eventHandlers={{
        click: () => onSelect(index),
        mouseover: () => onHover?.(index),
        mouseout: () => onHover?.(null),
      }}
    />
  );
}

export default function MapCanvas({
  trip,
  selectedIndex,
  onCitySelect,
  hoveredIndex = null,
  onCityHover,
  ghosts = [],
  onGhostSelect = () => undefined,
  insets = NO_INSETS,
  onBackgroundClick,
}: TripMapProps) {
  const bounds = useMemo(
    () => L.latLngBounds(routeBounds(trip.cities)),
    [trip.cities],
  );
  const initialBounds = useMemo(() => bounds.pad(0.25), [bounds]);

  return (
    <MapContainer
      bounds={initialBounds}
      minZoom={5}
      maxZoom={12}
      maxBoundsViscosity={1.0}
      zoomControl={false}
      scrollWheelZoom
      className="atlas-map h-full w-full"
    >
      <VectorBasemap />
      <MapFocus
        cities={trip.cities}
        selectedIndex={selectedIndex}
        bounds={bounds}
        insets={insets}
      />
      <MarkerFocusPan insets={insets} />
      <RouteLayer trip={trip} />
      {trip.cities.map((city, index) => (
        <CityMarker
          key={`${city.name}-${index}`}
          city={city}
          index={index}
          selected={selectedIndex === index}
          hovered={hoveredIndex === index}
          onSelect={onCitySelect}
          onHover={onCityHover}
        />
      ))}
      <GhostMarkers ghosts={ghosts} onSelect={onGhostSelect} />
      <MapDeclutter />
      {onBackgroundClick && <BackgroundClick onClick={onBackgroundClick} />}
      <MapControls bounds={bounds} insets={insets} />
      <MapLegend legs={trip.legs} hasGhosts={ghosts.length > 0} />
    </MapContainer>
  );
}
