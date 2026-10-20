import { BASE_CURRENCY, convertFromBase, type Currency, type Rates } from "./rates";

export type DistanceUnit = "km" | "mi";

export const KM_PER_MILE = 1.609344;

/** Route length, rounded to the nearest 10 in the viewer's unit. */
export function formatDistance(km: number, unit: DistanceUnit): string {
  const value = unit === "mi" ? km / KM_PER_MILE : km;
  return `~${(Math.round(value / 10) * 10).toLocaleString("en-US")} ${unit}`;
}

/** Converted amounts are estimates: keep two significant figures above 100. */
export function niceRound(value: number): number {
  if (value < 100) return Math.round(value);
  const step = 10 ** (Math.floor(Math.log10(value)) - 1);
  return Math.round(value / step) * step;
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * A USD amount (or [low, high] range) in the viewer's currency. Converted
 * values are rounded and marked "~"; without a rate it stays in USD.
 */
export function formatMoney(
  usd: number | readonly [number, number],
  currency: Currency,
  rates: Rates | null,
): string {
  const amounts = typeof usd === "number" ? [usd] : [...usd];
  const converted = amounts.map((amount) =>
    convertFromBase(amount, currency, rates),
  );

  if (converted.includes(null)) {
    return amounts.map((amount) => money(amount, BASE_CURRENCY)).join("–");
  }
  const exact = currency === BASE_CURRENCY;
  const text = (converted as number[])
    .map((value) => money(exact ? value : niceRound(value), currency))
    .join("–");
  return exact ? text : `~${text}`;
}
