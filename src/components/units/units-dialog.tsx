"use client";

import { Ruler } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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

const DISTANCES: DistanceUnit[] = ["km", "mi"];

/**
 * Round trigger + dialog for the viewer's distance unit and currency.
 * Purely presentational: trips keep km and USD underneath.
 */
export function UnitsDialog() {
  const { prefs, setPrefs, ratesStatus } = useUnits();
  const currencyId = useId();
  const t = useTranslations("Units");
  const currencyNames = new Intl.DisplayNames([useLocale()], { type: "currency" });

  return (
    <Dialog>
      <DialogTrigger
        aria-label={t("trigger")}
        title={t("trigger")}
        className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors outline-none hover:bg-accent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
      >
        <Ruler />
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <p className="eyebrow">{t("eyebrow")}</p>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <span id={`${currencyId}-distance`} className="text-sm font-medium">
            {t("distance")}
          </span>
          <div
            role="radiogroup"
            aria-labelledby={`${currencyId}-distance`}
            className="grid grid-cols-2 gap-1 rounded-full border border-line p-1"
          >
            {DISTANCES.map((value) => (
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
                {t(value)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={currencyId} className="text-sm font-medium">
            {t("currency")}
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
              {t("ratesUnavailable")}
            </output>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
