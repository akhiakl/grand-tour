import { describe, expect, it } from "vitest";

import { makeRates } from "@/test/fixtures/units";

import { formatDistance, formatMoney, niceRound } from "./format";

describe("formatDistance", () => {
  it("rounds kilometres to the nearest 10", () => {
    expect(formatDistance(1523, "km")).toBe("~1,520 km");
  });

  it("converts to miles", () => {
    expect(formatDistance(1520, "mi")).toBe("~940 mi");
  });
});

describe("niceRound", () => {
  it("keeps small amounts whole and large ones to two significant figures", () => {
    expect(niceRound(87.4)).toBe(87);
    expect(niceRound(144)).toBe(140);
    expect(niceRound(15_450)).toBe(15_000);
  });
});

describe("formatMoney", () => {
  const rates = makeRates();

  it("shows USD amounts exactly", () => {
    expect(formatMoney(125, "USD", null)).toBe("$125");
    expect(formatMoney([90, 160], "USD", rates)).toBe("$90–$160");
  });

  it("converts and marks estimates", () => {
    expect(formatMoney([100, 200], "EUR", rates)).toBe("~€90–€180");
    expect(formatMoney(100, "JPY", rates)).toBe("~¥15,000");
  });

  it("falls back to USD without a rate", () => {
    expect(formatMoney([90, 160], "EUR", null)).toBe("$90–$160");
    expect(formatMoney(90, "CHF", rates)).toBe("$90");
  });
});
