"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_FOOD = 6;

export function FoodEditor({
  value,
  onChange,
}: {
  readonly value: [string, string][];
  readonly onChange: (next: [string, string][]) => void;
}) {
  const update = (index: number, patch: { dish?: string; note?: string }) => {
    onChange(
      value.map((row, i) =>
        i === index ? ([patch.dish ?? row[0], patch.note ?? row[1]] as const) : row,
      ),
    );
  };

  const add = () => onChange([...value, ["", ""]]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="eyebrow">
          Food ({value.length}/{MAX_FOOD})
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={add}
          disabled={value.length >= MAX_FOOD}
        >
          <Plus /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {value.map((row, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={row[0]}
              onChange={(event) => update(index, { dish: event.target.value })}
              placeholder="Dish"
              aria-label="Dish"
              className="flex-1"
            />
            <Input
              value={row[1]}
              onChange={(event) => update(index, { note: event.target.value })}
              placeholder="Where to find it"
              aria-label="Where to find it"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Remove food row"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
