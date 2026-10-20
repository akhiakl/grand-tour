import { z } from "zod";

import type { DistanceUnit } from "./format";
import { CurrencySchema, SUPPORTED_CURRENCIES, type Currency } from "./rates";

/** A viewer's display choices; trips themselves always store km and USD. */
export interface DisplayPrefs {
  distance: DistanceUnit;
  currency: Currency;
}

export const DEFAULT_PREFS: DisplayPrefs = { distance: "km", currency: "USD" };

const PrefsSchema = z.object({
  distance: z.enum(["km", "mi"]),
  currency: CurrencySchema,
});

/** Regions that measure road distance in miles. */
const MILE_REGIONS = new Set(["US", "GB", "LR", "MM"]);

const EURO_REGIONS = new Set([
  "AT",
  "BE",
  "HR",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
]);

/** Region → currency for the supported non-euro currencies. */
const REGION_CURRENCY: Record<string, Currency> = {
  US: "USD",
  GB: "GBP",
  JP: "JPY",
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  CN: "CNY",
  HK: "HKD",
  NZ: "NZD",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  SG: "SGD",
  KR: "KRW",
  IN: "INR",
  ID: "IDR",
  MY: "MYR",
  PH: "PHP",
  TH: "THB",
  MX: "MXN",
  BR: "BRL",
  ZA: "ZAR",
  TR: "TRY",
  IL: "ILS",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  BG: "BGN",
  IS: "ISK",
};

/** First-visit defaults from the browser locale (`en-GB` → miles + GBP). */
export function defaultPrefs(locale: string | undefined): DisplayPrefs {
  let region: string | undefined;
  try {
    region = locale ? new Intl.Locale(locale).maximize().region : undefined;
  } catch {
    region = undefined;
  }
  if (!region) return DEFAULT_PREFS;

  const currency = EURO_REGIONS.has(region) ? "EUR" : REGION_CURRENCY[region];
  return {
    distance: MILE_REGIONS.has(region) ? "mi" : "km",
    currency: currency ?? DEFAULT_PREFS.currency,
  };
}

/** Stored prefs, or null when missing or no longer valid. */
export function parsePrefs(raw: string | null): DisplayPrefs | null {
  if (!raw) return null;
  try {
    const parsed = PrefsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function isSupportedCurrency(code: string): code is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}
