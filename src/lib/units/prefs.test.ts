import { describe, expect, it } from "vitest";

import {
  DEFAULT_PREFS,
  defaultPrefs,
  isSupportedCurrency,
  parsePrefs,
} from "./prefs";

describe("defaultPrefs", () => {
  it("derives units and currency from the locale's region", () => {
    expect(defaultPrefs("en-US")).toEqual({ distance: "mi", currency: "USD" });
    expect(defaultPrefs("en-GB")).toEqual({ distance: "mi", currency: "GBP" });
    expect(defaultPrefs("de-DE")).toEqual({ distance: "km", currency: "EUR" });
    expect(defaultPrefs("ja")).toEqual({ distance: "km", currency: "JPY" });
  });

  it("falls back for unknown, regionless or invalid locales", () => {
    expect(defaultPrefs("es-AR")).toEqual({ distance: "km", currency: "USD" });
    expect(defaultPrefs(undefined)).toEqual(DEFAULT_PREFS);
    expect(defaultPrefs("not a locale!")).toEqual(DEFAULT_PREFS);
  });
});

describe("parsePrefs", () => {
  it("reads valid stored prefs", () => {
    expect(parsePrefs('{"distance":"mi","currency":"EUR"}')).toEqual({
      distance: "mi",
      currency: "EUR",
    });
  });

  it("rejects missing, corrupt or unsupported values", () => {
    expect(parsePrefs(null)).toBeNull();
    expect(parsePrefs("{oops")).toBeNull();
    expect(parsePrefs('{"distance":"km","currency":"XYZ"}')).toBeNull();
  });
});

describe("isSupportedCurrency", () => {
  it("knows the picker's currencies", () => {
    expect(isSupportedCurrency("EUR")).toBe(true);
    expect(isSupportedCurrency("ARS")).toBe(false);
  });
});
