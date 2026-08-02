"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, X } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { City } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { DaysEditor } from "./days-editor";
import { FoodEditor } from "./food-editor";
import { ListFieldEditor } from "./list-field-editor";

export function StopCard({
  id,
  city,
  index,
  onChange,
  onRemove,
}: {
  readonly id: string;
  readonly city: City;
  readonly index: number;
  readonly onChange: (patch: Partial<City>) => void;
  readonly onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "frost rounded-xl p-4",
        isDragging && "z-10 opacity-70 shadow-soft",
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${city.name || "stop"}`}
          className="cursor-grab touch-none rounded-md p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <span className="font-display text-sm font-medium text-brass">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {city.flag} {city.name || "Untitled stop"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{city.country}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <Label htmlFor={`nights-${id}`} className="text-xs text-muted-foreground">
            Nights
          </Label>
          <Input
            id={`nights-${id}`}
            type="number"
            min={0}
            max={30}
            value={city.nights}
            onChange={(event) => onChange({ nights: Number(event.target.value) })}
            className="h-8 w-16"
          />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse details" : "Expand details"}
          className="rounded-md p-1.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
          />
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${city.name || "stop"}`}
          className="rounded-md p-1.5 text-muted-foreground outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          <div>
            <Label htmlFor={`why-${id}`} className="eyebrow mb-1.5 block">
              Why visit
            </Label>
            <Textarea
              id={`why-${id}`}
              value={city.why}
              onChange={(event) => onChange({ why: event.target.value })}
              rows={2}
            />
          </div>

          <ListFieldEditor
            label="Must see"
            value={city.must}
            onChange={(must) => onChange({ must })}
            max={10}
          />
          <ListFieldEditor
            label="Hidden gems"
            value={city.gems}
            onChange={(gems) => onChange({ gems })}
            max={6}
          />

          <FoodEditor value={city.food} onChange={(food) => onChange({ food })} />
          <DaysEditor value={city.days} onChange={(days) => onChange({ days })} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`budget-low-${id}`} className="eyebrow mb-1.5 block">
                Budget low (€/day)
              </Label>
              <Input
                id={`budget-low-${id}`}
                type="number"
                min={0}
                value={city.budget[0]}
                onChange={(event) =>
                  onChange({ budget: [Number(event.target.value), city.budget[1]] })
                }
              />
            </div>
            <div>
              <Label htmlFor={`budget-high-${id}`} className="eyebrow mb-1.5 block">
                Budget high (€/day)
              </Label>
              <Input
                id={`budget-high-${id}`}
                type="number"
                min={0}
                value={city.budget[1]}
                onChange={(event) =>
                  onChange({ budget: [city.budget[0], Number(event.target.value)] })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`transport-${id}`} className="eyebrow mb-1.5 block">
              Getting around
            </Label>
            <Input
              id={`transport-${id}`}
              value={city.transport}
              onChange={(event) => onChange({ transport: event.target.value })}
            />
          </div>

          <div>
            <Label htmlFor={`stay-${id}`} className="eyebrow mb-1.5 block">
              Where to stay
            </Label>
            <Textarea
              id={`stay-${id}`}
              value={city.stay}
              onChange={(event) => onChange({ stay: event.target.value })}
              rows={2}
            />
          </div>

          <ListFieldEditor
            label="Local tips"
            value={city.tips}
            onChange={(tips) => onChange({ tips })}
            max={6}
          />
        </div>
      )}
    </div>
  );
}
