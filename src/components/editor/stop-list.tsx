"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GUEST_MAX_CITIES, type City, type Leg } from "@/lib/trip";

import { CitySearch } from "./city-search";
import { LegRow } from "./leg-row";
import { StopRow } from "./stop-row";

const blankCity = (): City => ({
  name: "New stop",
  country: "",
  flag: "",
  ll: [0, 0],
  nights: 1,
  why: "",
  must: [],
  gems: [],
  food: [],
  days: [],
  budget: [0, 0],
  transport: "",
  stay: "",
  tips: [],
});

export function StopList({
  cities,
  legs,
  onAddCity,
  onRemoveCity,
  onMoveCity,
  onUpdateCity,
  onUpdateLeg,
  canAddCity,
  onLimitReached,
}: {
  readonly cities: City[];
  readonly legs: Leg[];
  readonly onAddCity: (city: City) => void;
  readonly onRemoveCity: (index: number) => void;
  readonly onMoveCity: (from: number, to: number) => void;
  readonly onUpdateCity: (index: number, patch: Partial<City>) => void;
  readonly onUpdateLeg: (index: number, patch: Partial<Leg>) => void;
  readonly canAddCity: boolean;
  readonly onLimitReached: () => void;
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Stops</h2>
        <span className="eyebrow">
          {cities.length}/{GUEST_MAX_CITIES} stops
        </span>
      </div>

      {cities.map((city, index) => (
        <div key={index}>
          <StopRow
            city={city}
            index={index}
            count={cities.length}
            expanded={expandedIndex === index}
            onToggleExpand={() =>
              setExpandedIndex((current) => (current === index ? null : index))
            }
            onChange={(patch) => onUpdateCity(index, patch)}
            onRemove={() => onRemoveCity(index)}
            onMoveUp={() => onMoveCity(index, index - 1)}
            onMoveDown={() => onMoveCity(index, index + 1)}
            draggable
            dragging={draggedIndex === index}
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedIndex !== null && draggedIndex !== index) {
                onMoveCity(draggedIndex, index);
              }
              setDraggedIndex(null);
            }}
            onDragEnd={() => setDraggedIndex(null)}
          />
          {index < legs.length && (
            <LegRow
              leg={legs[index]}
              index={index}
              onChange={(patch) => onUpdateLeg(index, patch)}
            />
          )}
        </div>
      ))}

      <Card className="gap-3">
        {canAddCity ? (
          <>
            <p className="text-sm text-muted-foreground">
              Search for the next stop.
            </p>
            <CitySearch
              onSelect={(result) =>
                onAddCity({
                  ...blankCity(),
                  name: result.name,
                  country: result.country,
                  flag: result.flag,
                  ll: result.ll,
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => onAddCity(blankCity())}
            >
              <Plus /> Or add a blank stop
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Guest maps top out at {GUEST_MAX_CITIES} stops.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLimitReached}
            >
              See what unlocks
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
