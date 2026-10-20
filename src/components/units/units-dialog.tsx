"use client";

import { Ruler } from "lucide-react";
import { useId } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUPPORTED_CURRENCIES,
  isSupportedCurrency,
  type DistanceUnit,
} from "@/lib/units";
import { cn } from "@/lib/utils";

import { useUnits } from "./units-provider";

const DISTANCES: { value: DistanceUnit; label: string }[] = [
  { value: "km", label: "Kilometres" },
  { value: "mi", label: "Miles" },
];

const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

/**
 * Round trigger + dialog for the viewer's distance unit and currency.
 * Purely presentational: trips keep km and USD underneath.
 */
export function UnitsDialog() {
  const { prefs, setPrefs, ratesStatus } = useUnits();
  const currencyId = useId();

  return (
    <Dialog>
      <DialogTrigger
        aria-label="Units and currency"
        title="Units and currency"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors outline-none hover:bg-accent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
      >
        <Ruler />
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <p className="eyebrow">Your view</p>
          <DialogTitle>Units &amp; currency</DialogTitle>
          <DialogDescription>
            Changes how routes read to you only. Budgets are estimated in US dollars
            and converted at today&apos;s rates.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <span id={`${currencyId}-distance`} className="text-sm font-medium">
            Distance
          </span>
          <div
            role="radiogroup"
            aria-labelledby={`${currencyId}-distance`}
            className="grid grid-cols-2 gap-1 rounded-full border border-line p-1"
          >
            {DISTANCES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={prefs.distance === value}
                onClick={() => setPrefs({ ...prefs, distance: value })}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  prefs.distance === value
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={currencyId} className="text-sm font-medium">
            Currency
          </label>
          <Select
            value={prefs.currency}
            onValueChange={(code) => {
              if (isSupportedCurrency(code)) setPrefs({ ...prefs, currency: code });
            }}
          >
            <SelectTrigger id={currencyId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {SUPPORTED_CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code} · {currencyNames.of(code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ratesStatus === "unavailable" && (
            <output className="block text-xs text-ink-soft">
              Live rates are out of reach right now, so amounts show in US dollars.
            </output>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
