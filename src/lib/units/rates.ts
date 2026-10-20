import { z } from "zod";

/** Budgets are stored in this currency; every other one is converted. */
export const BASE_CURRENCY = "USD";

/**
 * Currencies the picker offers: the ECB reference set (what the rates
 * source publishes daily), plus the US dollar base.
 */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "HKD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "SGD",
  "KRW",
  "INR",
  "IDR",
  "MYR",
  "PHP",
  "THB",
  "MXN",
  "BRL",
  "ZAR",
  "TRY",
  "ILS",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BGN",
  "ISK",
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const CurrencySchema = z.enum(SUPPORTED_CURRENCIES);

/** `/api/rates` body: units of each currency per 1 USD. */
export const RatesSchema = z.object({
  base: z.literal(BASE_CURRENCY),
  date: z.string(),
  rates: z.record(z.string(), z.number().positive()),
});

export type Rates = z.infer<typeof RatesSchema>;

/** Converts a USD amount, or null when no rate is known for `currency`. */
export function convertFromBase(
  amount: number,
  currency: Currency,
  rates: Rates | null,
): number | null {
  if (currency === BASE_CURRENCY) return amount;
  const rate = rates?.rates[currency];
  return rate === undefined ? null : amount * rate;
}
