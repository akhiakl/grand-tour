"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_DAYS = 10;

export function DaysEditor({
  value,
  onChange,
}: {
  readonly value: [string, string, string][];
  readonly onChange: (next: [string, string, string][]) => void;
}) {
  const update = (
    index: number,
    patch: { day?: string; theme?: string; plan?: string },
  ) => {
    onChange(
      value.map((row, i) =>
        i === index
          ? ([
              patch.day ?? row[0],
              patch.theme ?? row[1],
              patch.plan ?? row[2],
            ] as const)
          : row,
      ),
    );
  };

  const add = () => onChange([...value, [`Day ${value.length + 1}`, "", ""]]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="eyebrow">
          Day by day ({value.length}/{MAX_DAYS})
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={add}
          disabled={value.length >= MAX_DAYS}
        >
          <Plus /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {value.map((row, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={row[0]}
              onChange={(event) => update(index, { day: event.target.value })}
              placeholder="Day 1"
              aria-label="Day label"
              className="w-24 shrink-0"
            />
            <Input
              value={row[1]}
              onChange={(event) => update(index, { theme: event.target.value })}
              placeholder="Theme"
              aria-label="Theme"
              className="flex-1"
            />
            <Input
              value={row[2]}
              onChange={(event) => update(index, { plan: event.target.value })}
              placeholder="Plan"
              aria-label="Plan"
              className="flex-[2]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Remove day row"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
