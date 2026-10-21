import { describe, expect, it } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import { MAX_TRIP_PAYLOAD_BYTES } from "./schema";
import { parseTripFile, serializeTripFile, tripFileSlug } from "./trip-file";

describe("trip files", () => {
  it("round-trips a trip through an export", () => {
    const trip = makeTrip(3, { title: "Alps", startDate: "2027-05-01" });
    expect(parseTripFile(serializeTripFile(trip))).toEqual({ ok: true, trip });
  });

  it("accepts a bare trip JSON too", () => {
    const trip = makeTrip(2);
    expect(parseTripFile(JSON.stringify(trip))).toEqual({ ok: true, trip });
  });

  it("names what went wrong", () => {
    expect(parseTripFile("{oops")).toEqual({ ok: false, error: "not_json" });
    expect(parseTripFile('{"app":"grand-tour","version":1,"trip":{}}')).toEqual({
      ok: false,
      error: "not_a_trip",
    });
    expect(parseTripFile(JSON.stringify(makeTrip(6)))).toEqual({
      ok: false,
      error: "not_a_trip",
    });
    expect(parseTripFile(" ".repeat(MAX_TRIP_PAYLOAD_BYTES * 4 + 1))).toEqual({
      ok: false,
      error: "too_large",
    });
  });

  it("slugs titles into file names", () => {
    expect(tripFileSlug("Alps, slowly!")).toBe("alps-slowly");
    expect(tripFileSlug("—")).toBe("grand-tour");
  });
});
