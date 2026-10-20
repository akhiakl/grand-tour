"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnits } from "@/components/units/units-provider";
import { estimateLegDuration, type Leg } from "@/lib/trip";

import { MODE_META } from "../trip/mode";

const MODES = Object.keys(MODE_META) as Leg["mode"][];

/** Straight-line distance and a one-tap duration estimate for the mode. */
function LegEstimate({
  km,
  leg,
  onChange,
}: {
  readonly km: number;
  readonly leg: Leg;
  readonly onChange: (patch: Partial<Leg>) => void;
}) {
  const t = useTranslations("Editor.leg");
  const modes = useTranslations("Modes");
  const { distance } = useUnits();
  const estimate = estimateLegDuration(leg.mode, km);
  return (
    <p className="flex w-full flex-wrap items-center gap-x-2 text-xs text-ink-soft">
      <span>{t("crowFlies", { distance: distance(Math.round(km)) })}</span>
      {estimate !== leg.duration && (
        <button
          type="button"
          onClick={() => onChange({ duration: estimate })}
          className="rounded text-brass-text underline underline-offset-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("useEstimate", { estimate, mode: modes(leg.mode).toLowerCase() })}
        </button>
      )}
    </p>
  );
}

/** Editable connector between two stop rows: mode, label, duration. */
export function LegRow({
  leg,
  index,
  km,
  onChange,
}: {
  readonly leg: Leg;
  readonly index: number;
  /** Straight-line distance between its stops, once both are placed. */
  readonly km: number | null;
  readonly onChange: (patch: Partial<Leg>) => void;
}) {
  const t = useTranslations("Editor.leg");
  const modes = useTranslations("Modes");
  return (
    <div className="ml-5 flex flex-wrap items-end gap-3 border-l-2 border-dashed border-line py-3 pl-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`leg-${index}-mode`}>{t("mode")}</Label>
        <Select
          value={leg.mode}
          onValueChange={(mode) => onChange({ mode: mode as Leg["mode"] })}
        >
          <SelectTrigger id={`leg-${index}-mode`} className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {MODE_META[mode].emoji} {modes(mode)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 min-w-40 flex-col gap-1.5">
        <Label htmlFor={`leg-${index}-label`}>{t("label")}</Label>
        <Input
          id={`leg-${index}-label`}
          value={leg.label}
          maxLength={80}
          placeholder={t("labelPlaceholder")}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      <div className="flex w-28 flex-col gap-1.5">
        <Label htmlFor={`leg-${index}-duration`}>{t("duration")}</Label>
        <Input
          id={`leg-${index}-duration`}
          value={leg.duration}
          maxLength={20}
          placeholder={t("durationPlaceholder")}
          onChange={(e) => onChange({ duration: e.target.value })}
        />
      </div>
      {km !== null && <LegEstimate km={km} leg={leg} onChange={onChange} />}
    </div>
  );
}
