"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { CitySearchResult } from "@/lib/geo-search";
import type { City, Leg } from "@/lib/trip";

import { CitySearch } from "./city-search";
import { LegCard } from "./leg-card";
import { StopCard } from "./stop-card";
import { StopsCounter } from "./stops-counter";

export function StopsList({
  cities,
  legs,
  stopIds,
  atLimit,
  onAddCity,
  onRemoveCity,
  onReorderCities,
  onUpdateCity,
  onUpdateLeg,
  onLimitReached,
}: {
  readonly cities: City[];
  readonly legs: Leg[];
  readonly stopIds: string[];
  readonly atLimit: boolean;
  readonly onAddCity: (result: CitySearchResult) => void;
  readonly onRemoveCity: (index: number) => void;
  readonly onReorderCities: (from: number, to: number) => void;
  readonly onUpdateCity: (index: number, patch: Partial<City>) => void;
  readonly onUpdateLeg: (index: number, patch: Partial<Leg>) => void;
  readonly onLimitReached: () => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = stopIds.indexOf(String(active.id));
    const to = stopIds.indexOf(String(over.id));
    if (from !== -1 && to !== -1) onReorderCities(from, to);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Stops</h2>
        <StopsCounter count={cities.length} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stopIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {cities.map((city, index) => (
              <div key={stopIds[index]}>
                <StopCard
                  id={stopIds[index]}
                  city={city}
                  index={index}
                  count={cities.length}
                  onChange={(patch) => onUpdateCity(index, patch)}
                  onRemove={() => onRemoveCity(index)}
                />
                {index < legs.length && (
                  <LegCard
                    leg={legs[index]}
                    onChange={(patch) => onUpdateLeg(index, patch)}
                  />
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <CitySearch
        disabled={atLimit}
        onSelect={(result) => {
          if (atLimit) {
            onLimitReached();
            return;
          }
          onAddCity(result);
        }}
      />
      {atLimit && (
        <button
          type="button"
          onClick={onLimitReached}
          className="text-left text-xs text-brass underline-offset-2 hover:underline"
        >
          Guest routes top out at 5 stops — see what unlocks with an account
        </button>
      )}
    </div>
  );
}
