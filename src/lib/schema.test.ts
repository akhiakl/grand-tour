import { describe, expect, it } from "vitest";

import {
  CitySchema,
  DEFAULT_TRIP_TITLE,
  GUEST_MAX_CITIES,
  LegSchema,
  TripSchema,
  type City,
  type Leg,
} from "./schema";

const city = (overrides: Partial<City> = {}): City => ({
  name: "Vienna",
  country: "Austria",
  flag: "🇦🇹",
  ll: [48.2082, 16.3738],
  nights: 3,
  why: "Imperial boulevards, coffee houses and the Ringstrasse.",
  must: ["Schönbrunn", "Kunsthistorisches Museum"],
  gems: ["Palmenhaus"],
  food: [["Sachertorte", "Chocolate cake at Café Sacher"]],
  days: [["Day 1", "Old town", "Stephansdom, Graben, coffee house evening"]],
  budget: [90, 160],
  transport: "U-Bahn day passes",
  stay: "Innere Stadt for walkability",
  tips: ["Book opera standing tickets at dawn"],
  ...overrides,
});

const leg = (overrides: Partial<Leg> = {}): Leg => ({
  mode: "train",
  label: "Railjet via Linz",
  duration: "~2h 30m",
  ...overrides,
});

const trip = (cityCount = 2) => ({
  v: 1 as const,
  title: DEFAULT_TRIP_TITLE,
  cities: Array.from({ length: cityCount }, () => city()),
  legs: Array.from({ length: cityCount - 1 }, () => leg()),
  createdAt: Date.now(),
});

describe("CitySchema", () => {
  it("accepts a fully populated city", () => {
    expect(CitySchema.safeParse(city()).success).toBe(true);
  });

  it("rejects non-tuple coordinates", () => {
    expect(CitySchema.safeParse(city({ ll: [48.2] as never })).success).toBe(false);
  });

  it("rejects fractional or out-of-range nights", () => {
    expect(CitySchema.safeParse(city({ nights: 2.5 })).success).toBe(false);
    expect(CitySchema.safeParse(city({ nights: 31 })).success).toBe(false);
    expect(CitySchema.safeParse(city({ nights: -1 })).success).toBe(false);
  });

  it("caps list lengths", () => {
    const tooManyMust = Array.from({ length: 11 }, (_, i) => `Sight ${i}`);
    expect(CitySchema.safeParse(city({ must: tooManyMust })).success).toBe(false);
  });
});

describe("LegSchema", () => {
  it("accepts every supported transport mode", () => {
    for (const mode of ["train", "bus", "flight", "car", "ferry"] as const) {
      expect(LegSchema.safeParse(leg({ mode })).success).toBe(true);
    }
  });

  it("rejects unknown transport modes", () => {
    expect(LegSchema.safeParse(leg({ mode: "teleport" as never })).success).toBe(
      false,
    );
  });
});

describe("TripSchema", () => {
  it("accepts a valid two-city trip and defaults createdBy to guest", () => {
    const parsed = TripSchema.parse(trip());
    expect(parsed.createdBy).toBe("guest");
    expect(parsed.title).toBe("Grand Tour");
  });

  it("accepts exactly the guest maximum number of cities", () => {
    expect(TripSchema.safeParse(trip(GUEST_MAX_CITIES)).success).toBe(true);
  });

  it("rejects trips over the guest city limit", () => {
    expect(TripSchema.safeParse(trip(GUEST_MAX_CITIES + 1)).success).toBe(false);
  });

  it("rejects trips with fewer than two cities", () => {
    expect(TripSchema.safeParse(trip(1)).success).toBe(false);
  });

  it("rejects when legs do not connect consecutive cities", () => {
    const broken = { ...trip(3), legs: [leg()] };
    const result = TripSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["legs"]);
    }
  });

  it("rejects an empty or over-long title", () => {
    expect(TripSchema.safeParse({ ...trip(), title: "" }).success).toBe(false);
    expect(TripSchema.safeParse({ ...trip(), title: "x".repeat(81) }).success).toBe(
      false,
    );
  });

  it("rejects unknown schema versions", () => {
    expect(TripSchema.safeParse({ ...trip(), v: 2 }).success).toBe(false);
  });
});
