import { describe, expect, it } from "vitest";

import { makeCity, makeTrip } from "@/test/fixtures/trip";

import { formatDateSpan, stopDates, tripDateRange } from "./dates";

const dated = makeTrip(3, {
  startDate: "2027-05-30",
  cities: [
    makeCity({ nights: 2 }),
    makeCity({ nights: 0 }),
    makeCity({ nights: 3 }),
  ],
});

describe("stopDates", () => {
  it("is null for an undated trip", () => {
    expect(stopDates(makeTrip(2))).toBeNull();
    expect(tripDateRange(makeTrip(2))).toBeNull();
  });

  it("walks cumulative nights across month ends", () => {
    expect(stopDates(dated)).toEqual([
      { arrive: "2027-05-30", depart: "2027-06-01" },
      { arrive: "2027-06-01", depart: "2027-06-01" },
      { arrive: "2027-06-01", depart: "2027-06-04" },
    ]);
    expect(tripDateRange(dated)).toEqual({
      arrive: "2027-05-30",
      depart: "2027-06-04",
    });
  });
});

describe("formatDateSpan", () => {
  it("formats a single day and ranges within and across months", () => {
    expect(formatDateSpan({ arrive: "2027-06-01", depart: "2027-06-01" })).toBe(
      "Jun 1",
    );
    expect(formatDateSpan({ arrive: "2027-06-01", depart: "2027-06-04" })).toMatch(
      /^Jun 1\s?–\s?4$/,
    );
    expect(formatDateSpan({ arrive: "2027-05-30", depart: "2027-06-01" })).toMatch(
      /^May 30\s?–\s?Jun 1$/,
    );
  });
});
