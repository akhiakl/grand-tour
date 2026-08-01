import { describe, expect, it } from "vitest";

import { countryCodeToFlag } from "./flag";

describe("countryCodeToFlag", () => {
  it("converts a lowercase ISO code to its flag emoji", () => {
    expect(countryCodeToFlag("at")).toBe("🇦🇹");
    expect(countryCodeToFlag("fr")).toBe("🇫🇷");
  });

  it("is case-insensitive", () => {
    expect(countryCodeToFlag("AT")).toBe("🇦🇹");
  });

  it("falls back to a white flag for anything that isn't a 2-letter code", () => {
    expect(countryCodeToFlag("austria")).toBe("🏳️");
    expect(countryCodeToFlag("")).toBe("🏳️");
    expect(countryCodeToFlag("1a")).toBe("🏳️");
  });
});
