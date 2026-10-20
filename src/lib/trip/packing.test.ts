import { describe, expect, it } from "vitest";

import { makeCity, makeLeg, makeTrip } from "@/test/fixtures/trip";

import { packingList } from "./packing";

const ids = (trip: Parameters<typeof packingList>[0]) =>
  packingList(trip).map((item) => item.id);

describe("packingList", () => {
  it("names the adapter its countries need, grouped by socket type", () => {
    const trip = makeTrip(3, {
      cities: [
        makeCity({ country: "Austria" }),
        makeCity({ country: "Germany" }),
        makeCity({ country: "United Kingdom" }),
      ],
    });
    const list = packingList(trip);
    expect(list).toContainEqual({
      id: "adapter:C/F",
      key: "adapter",
      type: "C/F",
      countries: ["Austria", "Germany"],
    });
    expect(list).toContainEqual({
      id: "adapter:G",
      key: "adapter",
      type: "G",
      countries: ["United Kingdom"],
    });
    expect(ids(trip)).not.toContain("universalAdapter");
  });

  it("falls back to a universal adapter for unknown or blank countries", () => {
    const trip = makeTrip(2, {
      cities: [makeCity({ country: "Atlantis" }), makeCity({ country: " " })],
    });
    expect(ids(trip)).toContain("universalAdapter");
  });

  it("adds one ticket line per way of travelling, once each", () => {
    const trip = makeTrip(3, {
      legs: [makeLeg({ mode: "ferry" }), makeLeg({ mode: "ferry" })],
    });
    expect(ids(trip).filter((id) => id === "ferry")).toHaveLength(1);
    expect(ids(trip)).not.toContain("train");
  });

  it("adds cash for multi-country routes and laundry for a week or more", () => {
    const short = makeTrip(2, {
      cities: [makeCity({ nights: 2 }), makeCity({ nights: 2 })],
    });
    expect(ids(short)).not.toContain("laundry");
    expect(ids(short)).not.toContain("cash");

    const long = makeTrip(2, {
      cities: [
        makeCity({ nights: 4, country: "Italy" }),
        makeCity({ nights: 3, country: "France" }),
      ],
    });
    expect(ids(long)).toEqual(expect.arrayContaining(["laundry", "cash"]));
  });

  it("always includes the essentials", () => {
    expect(ids(makeTrip(2))).toEqual(
      expect.arrayContaining(["passport", "powerBank"]),
    );
  });
});
