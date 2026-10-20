import { describe, expect, it } from "vitest";

import { makeCity, makeLeg, makeTrip } from "@/test/fixtures/trip";

import { packingList } from "./packing";

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
    expect(list).toContain(
      "Power adapter for type C/F sockets (Austria and Germany)",
    );
    expect(list).toContain("Power adapter for type G sockets (United Kingdom)");
    expect(list).not.toContain("Universal travel adapter");
  });

  it("falls back to a universal adapter for unknown or blank countries", () => {
    const trip = makeTrip(2, {
      cities: [makeCity({ country: "Atlantis" }), makeCity({ country: " " })],
    });
    expect(packingList(trip)).toContain("Universal travel adapter");
  });

  it("adds one ticket line per way of travelling, once each", () => {
    const trip = makeTrip(3, {
      legs: [makeLeg({ mode: "ferry" }), makeLeg({ mode: "ferry" })],
    });
    const list = packingList(trip);
    expect(list.filter((item) => item.startsWith("Ferry booking"))).toHaveLength(1);
    expect(list).not.toContain("Rail tickets saved offline");
  });

  it("adds cash for multi-country routes and laundry for a week or more", () => {
    const short = makeTrip(2, {
      cities: [makeCity({ nights: 2 }), makeCity({ nights: 2 })],
    });
    expect(packingList(short)).not.toContain("Travel laundry kit");
    expect(packingList(short)).not.toContain("A little local cash for each country");

    const long = makeTrip(2, {
      cities: [
        makeCity({ nights: 4, country: "Italy" }),
        makeCity({ nights: 3, country: "France" }),
      ],
    });
    expect(packingList(long)).toContain("Travel laundry kit");
    expect(packingList(long)).toContain("A little local cash for each country");
  });

  it("always includes the essentials", () => {
    expect(packingList(makeTrip(2))).toEqual(
      expect.arrayContaining(["Passport & ID", "Power bank"]),
    );
  });
});
