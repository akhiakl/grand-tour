import { describe, expect, it } from "vitest";

import { SAMPLE_TRIP } from "./sample";
import { GUEST_MAX_CITIES } from "./schema";

describe("SAMPLE_TRIP", () => {
  it("is a valid trip at the guest city limit", () => {
    expect(SAMPLE_TRIP.cities).toHaveLength(GUEST_MAX_CITIES);
    expect(SAMPLE_TRIP.legs).toHaveLength(GUEST_MAX_CITIES - 1);
  });

  it("keeps the brand title", () => {
    expect(SAMPLE_TRIP.title).toBe("The Grand Tour");
  });
});
