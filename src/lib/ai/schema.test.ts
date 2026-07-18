import { describe, expect, it } from "vitest";

import { GUEST_MAX_CITIES } from "@/lib/schema";
import { makeCity, makeLeg } from "@/test/trip-fixtures";
import { AiTripSchema, GenerateRequestSchema } from "./schema";

describe("GenerateRequestSchema", () => {
  const valid = { destination: "Austria & Slovenia", days: 8, vibe: "balanced" };

  it("accepts the guided chat's three answers", () => {
    expect(GenerateRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects out-of-range days", () => {
    expect(GenerateRequestSchema.safeParse({ ...valid, days: 1 }).success).toBe(
      false,
    );
    expect(GenerateRequestSchema.safeParse({ ...valid, days: 31 }).success).toBe(
      false,
    );
    expect(GenerateRequestSchema.safeParse({ ...valid, days: 7.5 }).success).toBe(
      false,
    );
  });

  it("rejects unknown vibes and blank destinations", () => {
    expect(
      GenerateRequestSchema.safeParse({ ...valid, vibe: "chaotic" }).success,
    ).toBe(false);
    expect(
      GenerateRequestSchema.safeParse({ ...valid, destination: "x" }).success,
    ).toBe(false);
  });
});

describe("AiTripSchema", () => {
  const aiTrip = (cityCount = 2) => ({
    title: "Alpine Arc",
    cities: Array.from({ length: cityCount }, () => makeCity()),
    legs: Array.from({ length: cityCount - 1 }, () => makeLeg()),
  });

  it("accepts model output without suggestedExtra, defaulting it to []", () => {
    const parsed = AiTripSchema.parse(aiTrip());
    expect(parsed.suggestedExtra).toEqual([]);
  });

  it("accepts overflow stops in suggestedExtra", () => {
    const parsed = AiTripSchema.parse({
      ...aiTrip(),
      suggestedExtra: ["Trieste", "Zagreb"],
    });
    expect(parsed.suggestedExtra).toHaveLength(2);
  });

  it("enforces the guest city ceiling on model output", () => {
    expect(AiTripSchema.safeParse(aiTrip(GUEST_MAX_CITIES + 1)).success).toBe(false);
  });

  it("enforces the legs/cities relationship", () => {
    expect(AiTripSchema.safeParse({ ...aiTrip(3), legs: [makeLeg()] }).success).toBe(
      false,
    );
  });
});
