import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import {
  deleteLocalTrip,
  getLocalTrip,
  listLocalTrips,
  saveLocalTrip,
} from "./local-store";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("saveLocalTrip", () => {
  it("creates a fresh id when none is given, and it round-trips via getLocalTrip", () => {
    const id = saveLocalTrip(makeTrip());
    expect(id).toHaveLength(8);
    expect(getLocalTrip(id)?.title).toBe("Grand Tour");
  });

  it("overwrites the same slot when an id is given", () => {
    const id = saveLocalTrip(makeTrip(2, { title: "First" }));
    saveLocalTrip(makeTrip(2, { title: "Second" }), id);

    expect(getLocalTrip(id)?.title).toBe("Second");
    expect(listLocalTrips()).toHaveLength(1);
  });

  it("stamps createdAt to now on every save", () => {
    const before = Date.now();
    const id = saveLocalTrip(makeTrip(2, { createdAt: 1 }));
    expect(getLocalTrip(id)!.createdAt).toBeGreaterThanOrEqual(before);
  });

  it("adds the new id to the index without duplicating it", () => {
    const id = saveLocalTrip(makeTrip());
    saveLocalTrip(makeTrip(2, { title: "Edited" }), id);
    expect(listLocalTrips().map((entry) => entry.id)).toEqual([id]);
  });
});

describe("listLocalTrips", () => {
  it("returns [] when nothing has been saved", () => {
    expect(listLocalTrips()).toEqual([]);
  });

  it("lists newest-touched first", () => {
    // saveLocalTrip always stamps createdAt to "now", so control the clock
    // directly rather than relying on the fixture's createdAt.
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const older = saveLocalTrip(makeTrip());
    vi.setSystemTime(2000);
    const newer = saveLocalTrip(makeTrip());

    expect(listLocalTrips().map((entry) => entry.id)).toEqual([newer, older]);
  });

  it("drops entries that fail schema validation and removes them from the index", () => {
    const id = saveLocalTrip(makeTrip());
    window.localStorage.setItem(`trips:${id}`, JSON.stringify({ not: "a trip" }));

    expect(listLocalTrips()).toEqual([]);
    expect(window.localStorage.getItem(`trips:${id}`)).toBeNull();
  });

  it("ignores a corrupt index value instead of throwing", () => {
    window.localStorage.setItem("trips:index", "not json");
    expect(listLocalTrips()).toEqual([]);
  });
});

describe("getLocalTrip", () => {
  it("returns null for an id that was never saved", () => {
    expect(getLocalTrip("missing1")).toBeNull();
  });
});

describe("deleteLocalTrip", () => {
  it("removes the trip and its index entry", () => {
    const id = saveLocalTrip(makeTrip());
    deleteLocalTrip(id);

    expect(getLocalTrip(id)).toBeNull();
    expect(listLocalTrips()).toEqual([]);
  });

  it("is a no-op for an id that doesn't exist", () => {
    expect(() => deleteLocalTrip("missing1")).not.toThrow();
  });
});
