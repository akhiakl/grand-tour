"use client";

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
  const { distance } = useUnits();
  const estimate = estimateLegDuration(leg.mode, km);
  return (
    <p className="flex w-full flex-wrap items-center gap-x-2 text-xs text-ink-soft">
      <span>≈ {distance(Math.round(km))} as the crow flies</span>
      {estimate !== leg.duration && (
        <button
          type="button"
          onClick={() => onChange({ duration: estimate })}
          className="rounded text-brass-text underline underline-offset-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
        >
          Use estimate ({estimate} by {MODE_META[leg.mode].label.toLowerCase()})
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
  return (
    <div className="ml-5 flex flex-wrap items-end gap-3 border-l-2 border-dashed border-line py-3 pl-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`leg-${index}-mode`}>Mode</Label>
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
                {MODE_META[mode].emoji} {MODE_META[mode].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 min-w-40 flex-col gap-1.5">
        <Label htmlFor={`leg-${index}-label`}>Label</Label>
        <Input
          id={`leg-${index}-label`}
          value={leg.label}
          maxLength={80}
          placeholder="Railjet via Linz"
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      <div className="flex w-28 flex-col gap-1.5">
        <Label htmlFor={`leg-${index}-duration`}>Duration</Label>
        <Input
          id={`leg-${index}-duration`}
          value={leg.duration}
          maxLength={20}
          placeholder="~2h 30m"
          onChange={(e) => onChange({ duration: e.target.value })}
        />
      </div>
      {km !== null && <LegEstimate km={km} leg={leg} onChange={onChange} />}
    </div>
  );
}
