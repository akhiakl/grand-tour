import { describe, expect, it } from "vitest";

import { makeCity, makeTrip } from "@/test/fixtures/trip";

import { tripIcs } from "./ics";

const NOW = Date.parse("2027-01-02T03:04:05.678Z");

describe("tripIcs", () => {
  it("is null for an undated trip", () => {
    expect(tripIcs(makeTrip(2), NOW)).toBeNull();
  });

  it("emits one all-day event per stop with CRLF lines", () => {
    const trip = makeTrip(2, {
      title: "Alps, slowly",
      startDate: "2027-05-01",
      cities: [
        makeCity({ name: "Vienna", nights: 2 }),
        makeCity({ name: "Salzburg", nights: 0 }),
      ],
    });
    const ics = tripIcs(trip, NOW)!;
    const lines = ics.split("\r\n");

    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(lines).toContain("X-WR-CALNAME:Alps\\, slowly");
    expect(lines.filter((l) => l === "BEGIN:VEVENT")).toHaveLength(2);
    expect(lines).toContain("DTSTAMP:20270102T030405Z");
    expect(lines).toContain("DTSTART;VALUE=DATE:20270501");
    expect(lines).toContain("DTEND;VALUE=DATE:20270503");
    // The zero-night stop still occupies its arrival day.
    expect(lines).toContain("DTSTART;VALUE=DATE:20270503");
    expect(lines).toContain("DTEND;VALUE=DATE:20270504");
    expect(lines).toContain("SUMMARY:Salzburg · Alps\\, slowly");
  });

  it("escapes text and folds long lines under 75 octets", () => {
    const trip = makeTrip(2, {
      startDate: "2027-05-01",
      cities: [
        makeCity({ why: "Line one;\nline two — ".concat("é".repeat(80)) }),
        makeCity({ why: "" }),
      ],
    });
    const ics = tripIcs(trip, NOW)!;
    for (const line of ics.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain(String.raw`DESCRIPTION:Line one\;\nline two — é`);
    expect(unfolded.match(/DESCRIPTION:/g)).toHaveLength(1);
  });

  it("escapes a lone carriage return so it cannot start a new property", () => {
    const trip = makeTrip(2, {
      startDate: "2027-05-01",
      title: "Alps\rURL:https://example.com",
    });
    const ics = tripIcs(trip, NOW)!;
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/\r/);
    expect(ics).toContain(String.raw`X-WR-CALNAME:Alps\nURL:https://example.com`);
  });
});
