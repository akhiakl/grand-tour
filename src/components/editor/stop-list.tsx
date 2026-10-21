"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
}) {
  const t = useTranslations("Editor.stops");
  const issueText = useTranslations("Editor.issues");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // The open detail panel follows its stop through reorders and deletes.
  const moveCity = (from: number, to: number) => {
    onMoveCity(from, to);
    setExpandedIndex((current) =>
      current === null ? null : indexAfterMove(current, from, to),
    );
  };

  const issueAt = (path: string) => {
    const key = issues[path];
    return key ? issueText(key) : undefined;
  };

  const removeCity = (index: number) => {
    onRemoveCity(index);
    setExpandedIndex((current) =>
      current === null ? null : indexAfterRemove(current, index),
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">{t("heading")}</h2>
        <span className="eyebrow">
          {t("counter", { count: cities.length, max: GUEST_MAX_CITIES })}
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
            onRemove={() => removeCity(index)}
            onMoveUp={() => moveCity(index, index - 1)}
            onMoveDown={() => moveCity(index, index + 1)}
            draggable
            dragging={draggedIndex === index}
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedIndex !== null && draggedIndex !== index) {
                moveCity(draggedIndex, index);
              }
              setDraggedIndex(null);
            }}
            onDragEnd={() => setDraggedIndex(null)}
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

      <Card className="gap-3">
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
              onClick={() => onAddCity(blankCity(t("newStopName")))}
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
