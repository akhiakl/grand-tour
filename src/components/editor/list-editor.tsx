"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * Generic add/remove list field — the same shape backs every array field on
 * City (must/gems/tips as strings, food/days as tuples) via `renderRow`.
 */
export function ListEditor<T>({
  label,
  items,
  onChange,
  max,
  newItem,
  renderRow,
  addLabel = "Add",
}: {
  readonly label: string;
  readonly items: T[];
  readonly onChange: (items: T[]) => void;
  readonly max: number;
  readonly newItem: () => T;
  readonly renderRow: (item: T, onChange: (item: T) => void) => ReactNode;
  readonly addLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {items.length}/{max}
        </span>
      </div>

      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            {renderRow(item, (next) =>
              onChange(items.map((it, i) => (i === index ? next : it))),
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      {items.length < max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onChange([...items, newItem()])}
        >
          <Plus /> {addLabel}
        </Button>
      )}
    </div>
  );
}
