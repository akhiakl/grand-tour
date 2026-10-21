"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  blankCity,
  GUEST_MAX_CITIES,
  indexAfterMove,
  indexAfterRemove,
  type City,
  type DraftIssues,
  type Leg,
} from "@/lib/trip";

import { CitySearch } from "./city-search";
import { LegRow } from "./leg-row";
import { StopRow } from "./stop-row";
import { useStopDrag } from "./use-stop-drag";

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
  issues = {},
  activeIndex = null,
  onActivate,
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
  readonly issues?: DraftIssues;
  /** The stop being edited; the map preview follows it. */
  readonly activeIndex?: number | null;
  readonly onActivate?: (index: number) => void;
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // The open detail panel follows its stop through reorders and deletes,
  // and screen readers hear where the stop went.
  const moveCity = (from: number, to: number) => {
    onMoveCity(from, to);
    const name = cities[from]?.name || "Stop";
    setAnnouncement(`${name} moved to stop ${to + 1} of ${cities.length}.`);
    setExpandedIndex((current) =>
      current === null ? null : indexAfterMove(current, from, to),
    );
  };

  // Rows are keyed by position, so after a move the focused button would
  // belong to the neighbour; hand focus to the moved stop's button instead
  // (its other move button when it reached an end of the list).
  const moveWithButton = (from: number, to: number, direction: "up" | "down") => {
    moveCity(from, to);
    requestAnimationFrame(() => {
      const same = document.getElementById(`stop-${to}-move-${direction}`);
      const other = document.getElementById(
        `stop-${to}-move-${direction === "up" ? "down" : "up"}`,
      );
      (same && !same.hasAttribute("disabled") ? same : other)?.focus();
    });
  };

  const removeCity = (index: number) => {
    onRemoveCity(index);
    setExpandedIndex((current) =>
      current === null ? null : indexAfterRemove(current, index),
    );
  };

  const drag = useStopDrag(moveCity);

  return (
    <div className="flex flex-col gap-2">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Stops</h2>
        <span className="eyebrow">
          {cities.length}/{GUEST_MAX_CITIES} stops
        </span>
      </div>

      {cities.map((city, index) => (
        <div key={index} onFocusCapture={() => onActivate?.(index)}>
          <StopRow
            city={city}
            index={index}
            count={cities.length}
            expanded={expandedIndex === index}
            onToggleExpand={() =>
              setExpandedIndex((current) => (current === index ? null : index))
            }
            onChange={(patch) => onUpdateCity(index, patch)}
            onRemove={() => removeCity(index)}
            onMoveUp={() => moveWithButton(index, index - 1, "up")}
            onMoveDown={() => moveWithButton(index, index + 1, "down")}
            {...drag.rowProps(index)}
            dragging={drag.dragged === index}
            dropSide={drag.dropSide(index)}
            gripProps={drag.gripProps(index)}
            active={activeIndex === index}
            errors={{
              name: issues[`cities.${index}.name`],
              nights: issues[`cities.${index}.nights`],
            }}
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
