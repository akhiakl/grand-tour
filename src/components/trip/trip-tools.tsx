"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useMounted } from "@/hooks/use-mounted";
import {
  packingList,
  readTripTools,
  TRIP_TOOLS_LIMITS,
  writeTripTools,
  type Trip,
  type TripToolsScope,
  type TripToolsState,
} from "@/lib/trip";
import { cn } from "@/lib/utils";

import type { ToolId } from "./panel-actions";

/** Return link shared by every panel view that replaces the itinerary. */
export function BackToRoute({ onBack }: { readonly onBack: () => void }) {
  return (
    <button
      type="button"
      autoFocus
      onClick={onBack}
      className="-ml-1 flex w-fit items-center gap-1.5 rounded-full px-1 text-sm text-ink-soft transition-colors outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
    >
      <ArrowLeft /> Route
    </button>
  );
}

function ToolSection({
  open,
  title,
  onBack,
  children,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly onBack: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <section hidden={!open} className="flex flex-col gap-4">
      {open && <BackToRoute onBack={onBack} />}
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      {children}
    </section>
  );
}

function PackingItem({
  id,
  item,
  checked,
  onToggle,
  onRemove,
}: {
  readonly id: string;
  readonly item: string;
  readonly checked: boolean;
  readonly onToggle: () => void;
  readonly onRemove?: () => void;
}) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <label
        htmlFor={id}
        className={cn(
          "flex-1 cursor-pointer",
          checked && "text-muted-foreground line-through",
        )}
      >
        {item}
      </label>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item}`}
          className="rounded-full p-1 text-ink-soft outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
        >
          <X />
        </button>
      )}
    </li>
  );
}

function AddItemForm({ onAdd }: { readonly onAdd: (item: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onAdd(value.trim());
        setValue("");
      }}
    >
      <Input
        aria-label="Add a packing item"
        placeholder="Add your own…"
        maxLength={80}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="submit"
        aria-label="Add item"
        className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-ink-soft outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
      >
        <Plus />
      </button>
    </form>
  );
}

type ToolsProps = {
  readonly trip: Trip;
  readonly scope: TripToolsScope;
  readonly active: ToolId | null;
  readonly onBack: () => void;
};

/**
 * Packing checklist (shaped by the trip, plus the viewer's own items) and
 * notes, saved per trip in this browser. Both stay mounted (hidden when
 * inactive) so ticks and text survive switching back to the route. Saved
 * state lives in localStorage, so the body renders after mount only.
 */
export function TripTools(props: ToolsProps) {
  return useMounted() ? (
    <ToolsBody key={JSON.stringify(props.scope)} {...props} />
  ) : null;
}

function ToolsBody({ trip, scope, active, onBack }: ToolsProps) {
  const [state, setState] = useState<TripToolsState>(() => readTripTools(scope));
  const suggested = useMemo(() => packingList(trip), [trip]);
  const items = [
    ...suggested,
    ...state.custom.filter((c) => !suggested.includes(c)),
  ];
  const checked = new Set(state.checked);

  const update = (patch: Partial<TripToolsState>) => {
    const next = { ...state, ...patch };
    setState(next);
    writeTripTools(scope, next);
  };

  const toggle = (item: string) =>
    update({
      checked: checked.has(item)
        ? state.checked.filter((c) => c !== item)
        : [...state.checked, item],
    });

  const addItem = (item: string) => {
    if (items.includes(item) || state.custom.length >= TRIP_TOOLS_LIMITS.customItems)
      return;
    update({ custom: [...state.custom, item] });
  };

  const removeItem = (item: string) =>
    update({
      custom: state.custom.filter((c) => c !== item),
      checked: state.checked.filter((c) => c !== item),
    });

  const done = items.filter((item) => checked.has(item)).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <>
      <ToolSection
        open={active === "packing"}
        title="Packing checklist"
        onBack={onBack}
      >
        <div
          role="progressbar"
          aria-label="Packed"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1 overflow-hidden rounded-full bg-secondary"
        >
          <div
            className="h-full rounded-full bg-brass transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <PackingItem
              key={item}
              id={`packing-${index}`}
              item={item}
              checked={checked.has(item)}
              onToggle={() => toggle(item)}
              onRemove={
                suggested.includes(item) ? undefined : () => removeItem(item)
              }
            />
          ))}
        </ul>
        <AddItemForm onAdd={addItem} />
      </ToolSection>

      <ToolSection open={active === "notes"} title="Trip notes" onBack={onBack}>
        <textarea
          aria-label="Trip notes"
          value={state.notes}
          maxLength={TRIP_TOOLS_LIMITS.notesLength}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder="Booking codes, addresses, ideas…"
          className="min-h-48 w-full resize-y rounded-lg border border-line bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-ink-soft">
          Saved in this browser only, never in the shared link.
        </p>
      </ToolSection>
    </>
  );
}
