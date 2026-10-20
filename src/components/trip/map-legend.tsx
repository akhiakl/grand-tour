"use client";

import { Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import type { Leg } from "@/lib/trip";

import { MapOverlay } from "./map-overlay";
import { MODE_META } from "./mode";

function Row({
  symbol,
  label,
}: {
  readonly symbol: React.ReactNode;
  readonly label: string;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span aria-hidden className="grid w-5 place-items-center">
        {symbol}
      </span>
      {label}
    </li>
  );
}

/**
 * Collapsible key to the map's marks: stops, the selected stop, locked AI
 * suggestions (when present) and the transport modes this route uses.
 */
export function MapLegend({
  legs,
  hasGhosts,
}: {
  readonly legs: readonly Leg[];
  readonly hasGhosts: boolean;
}) {
  const t = useTranslations("Trip.legend");
  const modeName = useTranslations("Modes");
  const [open, setOpen] = useState(false);
  const id = useId();
  const modes = [...new Set(legs.map((leg) => leg.mode))];

  return (
    <MapOverlay className="bottom-[calc(var(--map-inset-bottom,0px)+12px)] left-[calc(var(--map-inset-left,0px)+12px)]">
      {open && (
        <div
          id={id}
          className="mb-2 w-48 rounded-xl border border-line bg-card-solid p-3 text-xs text-ink shadow-soft"
        >
          <p className="eyebrow mb-2">{t("title")}</p>
          <ul className="space-y-1.5">
            <Row symbol={<span className="legend-dot" />} label={t("stop")} />
            <Row
              symbol={<span className="legend-dot legend-dot-active" />}
              label={t("selected")}
            />
            {hasGhosts && (
              <Row
                symbol={<span className="legend-dot legend-dot-ghost" />}
                label={t("locked")}
              />
            )}
            {modes.map((mode) => (
              <Row
                key={mode}
                symbol={MODE_META[mode].emoji}
                label={modeName(mode)}
              />
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full border border-line bg-card-solid px-3 py-1.5 text-xs font-medium text-ink shadow-soft outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
      >
        {open ? <X /> : <Info />}
        {t("title")}
      </button>
    </MapOverlay>
  );
}
