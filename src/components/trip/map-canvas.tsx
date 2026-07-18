"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import { routeBounds, type City, type LatLng, type Trip } from "@/lib/trip";
import { escapeHtml } from "@/lib/utils";

import { RouteLayer } from "./route-layer";

const TILE_BASE =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";
const TILE_LABELS =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export interface TripMapProps {
  readonly trip: Trip;
  readonly selectedIndex: number | null;
  readonly onCitySelect: (index: number) => void;
}

/** Fits the route, fences panning, and flies to the selected stop. */
function MapFocus({
  cities,
  selectedIndex,
}: {
  readonly cities: City[];
  readonly selectedIndex: number | null;
}) {
  const map = useMap();
  const bounds = useMemo(() => L.latLngBounds(routeBounds(cities)), [cities]);

  useEffect(() => {
    map.setMaxBounds(bounds.pad(1));
  }, [map, bounds]);

  useEffect(() => {
    if (selectedIndex === null) {
      map.flyToBounds(bounds, { padding: [72, 72], duration: 1 });
    } else {
      map.flyTo(cities[selectedIndex].ll as LatLng, 9, { duration: 1.2 });
    }
  }, [map, bounds, cities, selectedIndex]);

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
        html: `<div class="marker${selected ? " marker-active" : ""}"><span class="marker-pulse"></span><span class="marker-dot"></span><span class="marker-lbl">${escapeHtml(city.flag)} ${escapeHtml(city.name)}</span></div>`,
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
}: TripMapProps) {
  const initialBounds = useMemo(
    () => L.latLngBounds(routeBounds(trip.cities)).pad(0.25),
    [trip.cities],
  );

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
      <TileLayer url={TILE_BASE} attribution={ATTRIBUTION} subdomains="abcd" />
      <TileLayer url={TILE_LABELS} subdomains="abcd" opacity={0.85} />
      <MapFocus cities={trip.cities} selectedIndex={selectedIndex} />
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
    </MapContainer>
  );
}
