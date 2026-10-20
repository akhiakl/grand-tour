import { describe, expect, it } from "vitest";

import { makeRates } from "@/test/fixtures/units";

import { convertFromBase, RatesSchema } from "./rates";

describe("convertFromBase", () => {
  const rates = makeRates();

  it("passes USD through and converts with a known rate", () => {
    expect(convertFromBase(100, "USD", null)).toBe(100);
    expect(convertFromBase(100, "GBP", rates)).toBe(80);
  });

  it("returns null without a rate", () => {
    expect(convertFromBase(100, "EUR", null)).toBeNull();
    expect(convertFromBase(100, "CHF", rates)).toBeNull();
  });
});

describe("RatesSchema", () => {
  it("accepts a USD-based table and rejects others", () => {
    expect(RatesSchema.safeParse(makeRates()).success).toBe(true);
    expect(RatesSchema.safeParse(makeRates({ base: "EUR" as "USD" })).success).toBe(
      false,
    );
  });
});
