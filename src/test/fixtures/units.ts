import type { Rates } from "@/lib/units";

/** Builders for display-unit data shared across unit tests. */

export const makeRates = (overrides: Partial<Rates> = {}): Rates => ({
  base: "USD",
  date: "2026-10-20",
  rates: { EUR: 0.9, GBP: 0.8, JPY: 150 },
  ...overrides,
});

/** Upstream Frankfurter `/latest?base=USD` payload. */
export const makeFrankfurterResponse = (
  overrides: Record<string, unknown> = {},
) => ({
  amount: 1,
  base: "USD",
  date: "2026-10-20",
  rates: { EUR: 0.9, GBP: 0.8, JPY: 150 },
  ...overrides,
});
