import { describe, expect, it } from "vitest";

import { destinationFromParam, planHref } from ".";

describe("planHref", () => {
  it("encodes the destination as a query parameter", () => {
    expect(planHref("Kyoto, Japan")).toBe("/plan?destination=Kyoto%2C+Japan");
  });
});

describe("destinationFromParam", () => {
  it("accepts a trimmed destination within the generator's limits", () => {
    expect(destinationFromParam("  Kyoto, Japan ")).toBe("Kyoto, Japan");
  });

  it("drops missing, repeated, too short or too long values", () => {
    expect(destinationFromParam(undefined)).toBeUndefined();
    expect(destinationFromParam(["Kyoto", "Osaka"])).toBeUndefined();
    expect(destinationFromParam(" K ")).toBeUndefined();
    expect(destinationFromParam("x".repeat(121))).toBeUndefined();
  });
});
