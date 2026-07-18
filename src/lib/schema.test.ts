import { describe, expect, it } from "vitest";

import { makeCity, makeLeg, makeTrip } from "@/test/trip-fixtures";
import { CitySchema, GUEST_MAX_CITIES, LegSchema, TripSchema } from "./schema";

describe("CitySchema", () => {
  it("accepts a fully populated city", () => {
    expect(CitySchema.safeParse(makeCity()).success).toBe(true);
  });

  it("rejects non-tuple coordinates", () => {
    expect(CitySchema.safeParse(makeCity({ ll: [48.2] as never })).success).toBe(
      false,
    );
  });

  it("rejects fractional or out-of-range nights", () => {
    expect(CitySchema.safeParse(makeCity({ nights: 2.5 })).success).toBe(false);
    expect(CitySchema.safeParse(makeCity({ nights: 31 })).success).toBe(false);
    expect(CitySchema.safeParse(makeCity({ nights: -1 })).success).toBe(false);
  });

  it("caps list lengths", () => {
    const tooManyMust = Array.from({ length: 11 }, (_, i) => `Sight ${i}`);
    expect(CitySchema.safeParse(makeCity({ must: tooManyMust })).success).toBe(
      false,
    );
  });
});

describe("LegSchema", () => {
  it("accepts every supported transport mode", () => {
    for (const mode of ["train", "bus", "flight", "car", "ferry"] as const) {
      expect(LegSchema.safeParse(makeLeg({ mode })).success).toBe(true);
    }
  });

  it("rejects unknown transport modes", () => {
    expect(LegSchema.safeParse(makeLeg({ mode: "teleport" as never })).success).toBe(
      false,
    );
  });
});

describe("TripSchema", () => {
  it("accepts a valid two-city trip and defaults createdBy to guest", () => {
    const parsed = TripSchema.parse({ ...makeTrip(), createdBy: undefined });
    expect(parsed.createdBy).toBe("guest");
    expect(parsed.title).toBe("Grand Tour");
  });

  it("accepts exactly the guest maximum number of cities", () => {
    expect(TripSchema.safeParse(makeTrip(GUEST_MAX_CITIES)).success).toBe(true);
  });

  it("rejects trips over the guest city limit", () => {
    expect(TripSchema.safeParse(makeTrip(GUEST_MAX_CITIES + 1)).success).toBe(false);
  });

  it("rejects trips with fewer than two cities", () => {
    expect(TripSchema.safeParse(makeTrip(1)).success).toBe(false);
  });

  it("rejects when legs do not connect consecutive cities", () => {
    const broken = makeTrip(3, { legs: [makeLeg()] });
    const result = TripSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["legs"]);
    }
  });

  it("rejects an empty or over-long title", () => {
    expect(TripSchema.safeParse(makeTrip(2, { title: "" })).success).toBe(false);
    expect(
      TripSchema.safeParse(makeTrip(2, { title: "x".repeat(81) })).success,
    ).toBe(false);
  });

  it("rejects unknown schema versions", () => {
    expect(TripSchema.safeParse({ ...makeTrip(), v: 2 }).success).toBe(false);
  });
});
