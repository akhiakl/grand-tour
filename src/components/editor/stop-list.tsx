"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  blankCity,
  GUEST_MAX_CITIES,
  indexAfterMove,
  indexAfterRemove,
  legDistanceKm,
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
  keys,
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
  /** Stable per-stop ids (`DraftTrip.keys`), so rows follow their stop. */
  readonly keys: readonly string[];
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
  const t = useTranslations("Editor.stops");
  const issueText = useTranslations("Editor.issues");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const addCardRef = useRef<HTMLDivElement>(null);

  // Focus a control once React has rendered the change that creates it.
  const focusAfterRender = (find: () => HTMLElement | null | undefined) =>
    requestAnimationFrame(() => find()?.focus());

  // The open detail panel follows its stop through reorders and deletes,
  // and screen readers hear where the stop went.
  const moveCity = (from: number, to: number) => {
    onMoveCity(from, to);
    setAnnouncement(
      t("moved", {
        name: cities[from]?.name || t("newStopName"),
        position: to + 1,
        count: cities.length,
      }),
    );
    setExpandedIndex((current) =>
      current === null ? null : indexAfterMove(current, from, to),
    );
  };

  // The row moves with its stop, so focus stays on the pressed button;
  // when the stop reaches an end of the list that button disables, so
  // hand focus to its other move button.
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

  const issueAt = (path: string) => {
    const key = issues[path];
    return key ? issueText(key) : undefined;
  };

  // The removed row took focus with it: land on the stop that slid into
  // its place (or the new last stop), or the search when none are left.
  const removeCity = (index: number) => {
    onRemoveCity(index);
    const left = cities.length - 1;
    focusAfterRender(() =>
      left > 0
        ? document.getElementById(`stop-${Math.min(index, left - 1)}-name`)
        : addCardRef.current?.querySelector("input"),
    );
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
        <h2 className="font-display text-lg font-medium">{t("heading")}</h2>
        <span className="eyebrow">
          {t("counter", { count: cities.length, max: GUEST_MAX_CITIES })}
        </span>
      </div>

      {cities.map((city, index) => (
        <div key={keys[index]} onFocusCapture={() => onActivate?.(index)}>
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
              name: issueAt(`cities.${index}.name`),
              nights: issueAt(`cities.${index}.nights`),
            }}
          />
          {index < legs.length && (
            <LegRow
              leg={legs[index]}
              index={index}
              km={legDistanceKm(city, cities[index + 1])}
              onChange={(patch) => onUpdateLeg(index, patch)}
            />
          )}
        </div>
      ))}

      <Card ref={addCardRef} className="gap-3">
        {canAddCity ? (
          <>
            <p className="text-sm text-muted-foreground">{t("searchNext")}</p>
            <CitySearch
              onSelect={(result) =>
                onAddCity({
                  ...blankCity(t("newStopName")),
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
              onClick={() => {
                onAddCity(blankCity(t("newStopName")));
                focusAfterRender(() =>
                  document.getElementById(`stop-${cities.length}-name`),
                );
              }}
            >
              <Plus /> {t("addBlank")}
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("limit", { max: GUEST_MAX_CITIES })}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLimitReached}
            >
              {t("seeUnlocks")}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
