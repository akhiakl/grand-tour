"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useMemo, type CSSProperties } from "react";
import { MapContainer, Marker, useMap } from "react-leaflet";

import type { GhostStop } from "@/lib/ai";
import { routeBounds, type City, type LatLng, type Trip } from "@/lib/trip";
import { escapeHtml } from "@/lib/utils";

import { fitPadding } from "./fit-padding";
import { GhostMarkers } from "./ghost-markers";
import { MapControls } from "./map-controls";
import { MapDeclutter } from "./map-declutter";
import { MapLegend } from "./map-legend";
import { RouteLayer } from "./route-layer";
import { VectorBasemap } from "./vector-basemap";

export interface TripMapProps {
  readonly trip: Trip;
  readonly selectedIndex: number | null;
  readonly onCitySelect: (index: number) => void;
  /** Locked AI suggestions (editor only); selecting one opens the upsell. */
  readonly ghosts?: readonly GhostStop[];
  readonly onGhostSelect?: () => void;
  /** Pixels the mobile bottom sheet covers; fits and overlays clear it. */
  readonly bottomInset?: number;
}

const CITY_ZOOM = 9;

/** Fits the route, fences panning, and flies to the selected stop. */
function MapFocus({
  cities,
  selectedIndex,
  bounds,
  bottomInset,
}: {
  readonly cities: City[];
  readonly selectedIndex: number | null;
  readonly bounds: L.LatLngBounds;
  readonly bottomInset: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(bounds.pad(1));
  }, [map, bounds]);

  useEffect(() => {
    if (selectedIndex === null) {
      map.flyToBounds(bounds, {
        ...fitPadding(bottomInset),
        duration: 1,
      });
    } else {
      // Centre the stop in the part of the map the sheet leaves visible.
      const point = map
        .project(cities[selectedIndex].ll as LatLng, CITY_ZOOM)
        .add([0, bottomInset / 2]);
      map.flyTo(map.unproject(point, CITY_ZOOM), CITY_ZOOM, { duration: 1.2 });
    }
  }, [map, bounds, cities, selectedIndex, bottomInset]);

  return null;
}

function CityMarker({
  city,
  index,
  selected,
  onSelect,
}: {
  readonly city: City;
  readonly index: number;
  readonly selected: boolean;
  readonly onSelect: (index: number) => void;
}) {
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

  return (
    <Marker
      position={city.ll as LatLng}
      icon={icon}
      alt={`${city.name}, stop ${index + 1}`}
      eventHandlers={{ click: () => onSelect(index) }}
    />
  );
}

export default function MapCanvas({
  trip,
  selectedIndex,
  onCitySelect,
  ghosts = [],
  onGhostSelect = () => undefined,
  bottomInset = 0,
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
      style={{ "--map-inset-bottom": `${bottomInset}px` } as CSSProperties}
    >
      <VectorBasemap />
      <MapFocus
        cities={trip.cities}
        selectedIndex={selectedIndex}
        bounds={bounds}
        bottomInset={bottomInset}
      />
      <RouteLayer trip={trip} />
      {trip.cities.map((city, index) => (
        <CityMarker
          key={`${city.name}-${index}`}
          city={city}
          index={index}
          selected={selectedIndex === index}
          onSelect={onCitySelect}
        />
      ))}
      <GhostMarkers ghosts={ghosts} onSelect={onGhostSelect} />
      <MapDeclutter />
      <MapControls bounds={bounds} bottomInset={bottomInset} />
      <MapLegend legs={trip.legs} hasGhosts={ghosts.length > 0} />
    </MapContainer>
  );
}
