"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";

import { routeBounds, type City, type LatLng, type Trip } from "@/lib/trip";

import { RouteLayer } from "./route-layer";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export interface TripMapProps {
  trip: Trip;
  selectedIndex: number | null;
  onCitySelect: (index: number) => void;
}

/** Fits the viewport to the route and fences panning near it. */
function FitToRoute({ cities }: { cities: City[] }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(routeBounds(cities));
    map.fitBounds(bounds, { padding: [48, 48] });
    map.setMaxBounds(bounds.pad(0.75));
  }, [map, cities]);

  return null;
}

function CityMarker({
  city,
  index,
  selected,
  onSelect,
}: {
  city: City;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "city-marker-anchor",
        html: `<span class="city-marker" data-selected="${selected}">${index + 1}</span>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    [index, selected],
  );

  return (
    <Marker
      position={city.ll as LatLng}
      icon={icon}
      alt={`${city.name}, stop ${index + 1}`}
      eventHandlers={{ click: () => onSelect(index) }}
    >
      <Tooltip permanent direction="top" offset={[0, -16]} className="city-label">
        {city.name}
      </Tooltip>
    </Marker>
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
      scrollWheelZoom
      className="atlas-map h-full w-full rounded-[inherit]"
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} subdomains="abcd" />
      <FitToRoute cities={trip.cities} />
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
