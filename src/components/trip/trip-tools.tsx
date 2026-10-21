"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useMounted } from "@/hooks/use-mounted";
import {
  packingList,
  readTripTools,
  type PackingItem as SuggestedItem,
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
  const t = useTranslations("Trip.panel");
  return (
    <button
      type="button"
      autoFocus
      onClick={onBack}
      className="-ml-1 flex w-fit items-center gap-1.5 rounded-full px-1 text-sm text-ink-soft transition-colors outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
    >
      <ArrowLeft /> {t("back")}
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
  readonly onRemove: () => void;
}) {
  const t = useTranslations("Trip.tools");
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
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("removeItem", { item })}
        className="rounded-full p-1 text-ink-soft outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
      >
        <X />
      </button>
    </li>
  );
}

function AddItemForm({ onAdd }: { readonly onAdd: (item: string) => void }) {
  const t = useTranslations("Trip.tools");
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
        aria-label={t("addItem")}
        placeholder={t("addItemPlaceholder")}
        maxLength={80}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        type="submit"
        aria-label={t("addItemButton")}
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

/** A checklist row: a suggested item (translated) or one the viewer added. */
type ChecklistItem = { id: string; label: string };

const customId = (text: string) => `custom:${text}`;

function useSuggestedLabel() {
  const t = useTranslations("Trip.packing");
  const list = new Intl.ListFormat(useLocale(), {
    style: "long",
    type: "conjunction",
  });
  return (item: SuggestedItem) =>
    item.key === "adapter"
      ? t("adapter", { type: item.type, countries: list.format(item.countries) })
      : t(item.key);
}

function ToolsBody({ trip, scope, active, onBack }: ToolsProps) {
  const t = useTranslations("Trip.tools");
  const label = useSuggestedLabel();
  const [state, setState] = useState<TripToolsState>(() => readTripTools(scope));
  const suggested = useMemo(() => packingList(trip), [trip]);
  const hidden = new Set(state.hidden);
  const hiddenCount = suggested.filter((item) => hidden.has(item.id)).length;
  const items: ChecklistItem[] = [
    ...suggested
      .filter((item) => !hidden.has(item.id))
      .map((item) => ({ id: item.id, label: label(item) })),
    ...state.custom.map((text) => ({ id: customId(text), label: text })),
  ];
  const checked = new Set(state.checked);

  const update = (patch: Partial<TripToolsState>) => {
    const next = { ...state, ...patch };
    setState(next);
    writeTripTools(scope, next);
  };

  const toggle = (id: string) =>
    update({
      checked: checked.has(id)
        ? state.checked.filter((c) => c !== id)
        : [...state.checked, id],
    });

  const addItem = (text: string) => {
    if (
      state.custom.includes(text) ||
      state.custom.length >= TRIP_TOOLS_LIMITS.customItems
    )
      return;
    update({ custom: [...state.custom, text] });
  };

  // Own items are deleted; suggestions are hidden so they can come back.
  const removeItem = (id: string) =>
    update({
      custom: state.custom.filter((text) => customId(text) !== id),
      hidden: id.startsWith("custom:") ? state.hidden : [...state.hidden, id],
      checked: state.checked.filter((c) => c !== id),
    });

  const done = items.filter((item) => checked.has(item.id)).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <>
      <ToolSection
        open={active === "packing"}
        title={t("packingTitle")}
        onBack={onBack}
      >
        <div
          role="progressbar"
          aria-label={t("packed")}
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
              key={item.id}
              id={`packing-${index}`}
              item={item.label}
              checked={checked.has(item.id)}
              onToggle={() => toggle(item.id)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </ul>
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => update({ hidden: [] })}
            className="w-fit rounded text-xs text-brass-text underline underline-offset-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("restoreSuggestions", { count: hiddenCount })}
          </button>
        )}
        <AddItemForm onAdd={addItem} />
      </ToolSection>

      <ToolSection open={active === "notes"} title={t("notesTitle")} onBack={onBack}>
        <textarea
          aria-label={t("notesTitle")}
          value={state.notes}
          maxLength={TRIP_TOOLS_LIMITS.notesLength}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder={t("notesPlaceholder")}
          className="min-h-48 w-full resize-y rounded-lg border border-line bg-transparent p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-ink-soft">{t("notesPrivacy")}</p>
      </ToolSection>
    </>
  );
}
