"use client";

import {
  ChevronDown,
  CircleAlert,
  GripVertical,
  MoveDown,
  MoveUp,
  Trash2,
} from "lucide-react";
import type { DragEventHandler, PointerEventHandler } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clampNights, type City } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { StopRowDetails } from "./stop-row-details";
import type { DropSide } from "./use-stop-drag";

/** Inline validation messages for the always-visible fields. */
export type StopRowErrors = { readonly name?: string; readonly nights?: string };

/** One stop: always-visible identity fields, expandable full detail form. */
export function StopRow({
  city,
  index,
  count,
  expanded,
  onToggleExpand,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragging,
  dropSide = null,
  gripProps,
  active = false,
  errors = {},
}: {
  readonly city: City;
  readonly index: number;
  readonly count: number;
  readonly expanded: boolean;
  readonly onToggleExpand: () => void;
  readonly onChange: (patch: Partial<City>) => void;
  readonly onRemove: () => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly draggable: boolean;
  readonly onDragStart: DragEventHandler<HTMLDivElement>;
  readonly onDragOver: DragEventHandler<HTMLDivElement>;
  readonly onDrop: DragEventHandler<HTMLDivElement>;
  readonly onDragEnd: DragEventHandler<HTMLDivElement>;
  readonly dragging: boolean;
  /** Where a dragged stop would land relative to this one. */
  readonly dropSide?: DropSide;
  /** Holding the grip is what makes the row draggable. */
  readonly gripProps?: {
    readonly onPointerDown: PointerEventHandler<HTMLDivElement>;
    readonly onPointerUp: PointerEventHandler<HTMLDivElement>;
  };
  /** The stop being edited, shown on the map. */
  readonly active?: boolean;
  readonly errors?: StopRowErrors;
}) {
  const nameErrorId = `stop-${index}-name-error`;
  const nightsErrorId = `stop-${index}-nights-error`;

  return (
    <Card
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "relative gap-3 transition-opacity",
        dragging && "opacity-40",
        active && "border-brass/60",
      )}
    >
      {dropSide && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-4 h-0.5 rounded-full bg-brass",
            dropSide === "before" ? "-top-1.5" : "-bottom-1.5",
          )}
        />
      )}
      <div className="flex flex-wrap items-end gap-3">
        <div
          className="mt-6 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-hidden
          {...gripProps}
        >
          <GripVertical className="size-5" />
        </div>

        <div className="flex w-16 flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-flag`}>Flag</Label>
          <Input
            id={`stop-${index}-flag`}
            value={city.flag}
            maxLength={8}
            onChange={(e) => onChange({ flag: e.target.value })}
          />
        </div>

        <div className="flex min-w-32 flex-1 flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-name`}>City</Label>
          <Input
            id={`stop-${index}-name`}
            value={city.name}
            maxLength={60}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? nameErrorId : undefined}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="flex min-w-32 flex-1 flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-country`}>Country</Label>
          <Input
            id={`stop-${index}-country`}
            value={city.country}
            maxLength={60}
            onChange={(e) => onChange({ country: e.target.value })}
          />
        </div>

        <div className="flex w-24 flex-col gap-1.5">
          <Label htmlFor={`stop-${index}-nights`}>Nights</Label>
          <Input
            id={`stop-${index}-nights`}
            type="number"
            min={0}
            max={30}
            value={city.nights}
            aria-invalid={errors.nights ? true : undefined}
            aria-describedby={errors.nights ? nightsErrorId : undefined}
            onChange={(e) =>
              onChange({ nights: clampNights(Number(e.target.value)) })
            }
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move ${city.name || "stop"} up`}
            disabled={index === 0}
            onClick={onMoveUp}
          >
            <MoveUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move ${city.name || "stop"} down`}
            disabled={index === count - 1}
            onClick={onMoveDown}
          >
            <MoveDown />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={expanded ? "Collapse details" : "Edit all details"}
            aria-expanded={expanded}
            onClick={onToggleExpand}
          >
            <ChevronDown
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${city.name || "stop"}`}
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <FieldError id={nameErrorId} message={errors.name} />
      <FieldError id={nightsErrorId} message={errors.nights} />

      {expanded && <StopRowDetails city={city} index={index} onChange={onChange} />}
    </Card>
  );
}

function FieldError({
  id,
  message,
}: {
  readonly id: string;
  readonly message?: string;
}) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-destructive">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
