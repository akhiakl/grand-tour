import { beforeEach, describe, expect, it } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import {
  deleteLocalTrip,
  getLocalTrip,
  listLocalTrips,
  saveLocalTrip,
} from "./local-store";

describe("local-store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves a trip under a generated id and reads it back", () => {
    const id = saveLocalTrip(makeTrip());
    expect(id).toHaveLength(8);

    const record = getLocalTrip(id);
    expect(record?.id).toBe(id);
    expect(record?.trip.title).toBe("Grand Tour");
    expect(record?.updatedAt).toBeGreaterThan(0);
  });

  it("updates an existing trip in place without duplicating the index entry", () => {
    const id = saveLocalTrip(makeTrip());
    saveLocalTrip(makeTrip(3, { title: "Revised" }), id);

    expect(listLocalTrips()).toHaveLength(1);
    expect(getLocalTrip(id)?.trip.title).toBe("Revised");
  });

  it("lists trips newest-updated first", () => {
    const first = saveLocalTrip(makeTrip(2, { title: "First" }));
    window.localStorage.setItem(
      `trips:${first}`,
      JSON.stringify({ trip: getLocalTrip(first)!.trip, updatedAt: 1000 }),
    );
    const second = saveLocalTrip(makeTrip(2, { title: "Second" }));
    window.localStorage.setItem(
      `trips:${second}`,
      JSON.stringify({ trip: getLocalTrip(second)!.trip, updatedAt: 2000 }),
    );

    expect(listLocalTrips().map((r) => r.trip.title)).toEqual(["Second", "First"]);
  });

  it("deletes a trip and its index entry", () => {
    const id = saveLocalTrip(makeTrip());
    deleteLocalTrip(id);

    expect(getLocalTrip(id)).toBeNull();
    expect(listLocalTrips()).toHaveLength(0);
  });

  it("returns null for a missing id", () => {
    expect(getLocalTrip("missing1")).toBeNull();
  });

  it("drops a corrupt record and prunes it from the index", () => {
    const id = saveLocalTrip(makeTrip());
    window.localStorage.setItem(`trips:${id}`, "not json");

    expect(listLocalTrips()).toHaveLength(0);
    expect(JSON.parse(window.localStorage.getItem("trips:index")!)).toEqual([]);
  });

  it("drops a record that fails schema validation", () => {
    const id = saveLocalTrip(makeTrip());
    window.localStorage.setItem(
      `trips:${id}`,
      JSON.stringify({ trip: { not: "a trip" }, updatedAt: Date.now() }),
    );

    expect(getLocalTrip(id)).toBeNull();
    expect(listLocalTrips()).toHaveLength(0);
  });

  it("ignores a corrupt index and treats storage as empty", () => {
    window.localStorage.setItem("trips:index", "not json");
    expect(listLocalTrips()).toEqual([]);
  });

  it("ignores an index that is valid JSON but not a string array", () => {
    window.localStorage.setItem("trips:index", JSON.stringify({ nope: true }));
    expect(listLocalTrips()).toEqual([]);
  });

  it("deleting an id that was never saved is a no-op", () => {
    expect(() => deleteLocalTrip("ghost123")).not.toThrow();
    expect(listLocalTrips()).toHaveLength(0);
  });
});
