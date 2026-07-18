import { describe, expect, it } from "vitest";

import { GUEST_MAX_CITIES } from "@/lib/trip";
import { makeAiTrip, makeGenerateRequest } from "@/test/fixtures/ai";
import { makeLeg } from "@/test/fixtures/trip";

import { AiTripSchema, GenerateRequestSchema } from "./schema";

describe("GenerateRequestSchema", () => {
  it("accepts the guided chat's three answers", () => {
    expect(GenerateRequestSchema.safeParse(makeGenerateRequest()).success).toBe(
      true,
    );
  });

  it("rejects out-of-range days", () => {
    for (const days of [1, 31, 7.5]) {
      expect(
        GenerateRequestSchema.safeParse(makeGenerateRequest({ days })).success,
      ).toBe(false);
    }
  });

  it("rejects unknown vibes and blank destinations", () => {
    expect(
      GenerateRequestSchema.safeParse(
        makeGenerateRequest({ vibe: "chaotic" as never }),
      ).success,
    ).toBe(false);
    expect(
      GenerateRequestSchema.safeParse(makeGenerateRequest({ destination: "x" }))
        .success,
    ).toBe(false);
  });
});

describe("AiTripSchema", () => {
  it("accepts model output without suggestedExtra, defaulting it to []", () => {
    const parsed = AiTripSchema.parse({
      ...makeAiTrip(),
      suggestedExtra: undefined,
    });
    expect(parsed.suggestedExtra).toEqual([]);
  });

  it("accepts overflow stops in suggestedExtra", () => {
    const parsed = AiTripSchema.parse(
      makeAiTrip(2, { suggestedExtra: ["Trieste", "Zagreb"] }),
    );
    expect(parsed.suggestedExtra).toHaveLength(2);
  });

  it("enforces the guest city ceiling on model output", () => {
    expect(AiTripSchema.safeParse(makeAiTrip(GUEST_MAX_CITIES + 1)).success).toBe(
      false,
    );
  });

  it("enforces the legs/cities relationship", () => {
    expect(
      AiTripSchema.safeParse(makeAiTrip(3, { legs: [makeLeg()] })).success,
    ).toBe(false);
  });
});
