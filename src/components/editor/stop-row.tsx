"use client";

import { ChevronDown, GripVertical, MoveDown, MoveUp, Trash2 } from "lucide-react";
import type { DragEventHandler } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { City } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { StopRowDetails } from "./stop-row-details";

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
}) {
  return (
    <Card
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn("gap-3 transition-opacity", dragging && "opacity-40")}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div
          className="mt-6 cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-hidden
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
            onChange={(e) => onChange({ nights: Number(e.target.value) })}
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

      {expanded && <StopRowDetails city={city} index={index} onChange={onChange} />}
    </Card>
  );
}
