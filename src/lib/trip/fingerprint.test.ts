import { describe, expect, it } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import { tripFingerprint } from "./fingerprint";

describe("tripFingerprint", () => {
  it("ignores when and by whom the trip was created", () => {
    const trip = makeTrip(2);
    expect(tripFingerprint({ ...trip, createdAt: 1, createdBy: "user" })).toBe(
      tripFingerprint(trip),
    );
  });

  it("changes with anything a viewer would see", () => {
    const trip = makeTrip(2);
    const base = tripFingerprint(trip);
    expect(tripFingerprint({ ...trip, title: "Other" })).not.toBe(base);
    expect(tripFingerprint({ ...trip, startDate: "2027-05-01" })).not.toBe(base);
    expect(tripFingerprint(makeTrip(3))).not.toBe(base);
  });
});
