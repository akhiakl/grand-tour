import { describe, expect, it } from "vitest";

import { countryCodeToFlag } from "./flag";

describe("countryCodeToFlag", () => {
  it("converts a lowercase ISO 3166-1 alpha-2 code to a flag emoji", () => {
    expect(countryCodeToFlag("fr")).toBe("🇫🇷");
  });

  it("converts an uppercase code to a flag emoji", () => {
    expect(countryCodeToFlag("US")).toBe("🇺🇸");
  });

  it("returns an empty string for undefined", () => {
    expect(countryCodeToFlag(undefined)).toBe("");
  });

  it("returns an empty string for a non two-letter code", () => {
    expect(countryCodeToFlag("USA")).toBe("");
    expect(countryCodeToFlag("1x")).toBe("");
  });
});
