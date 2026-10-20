import { beforeEach, describe, expect, it } from "vitest";

import {
  EMPTY_TRIP_TOOLS,
  clearTripTools,
  readTripTools,
  tripToolsKey,
  writeTripTools,
} from "./tools-store";

beforeEach(() => {
  window.localStorage.clear();
});

describe("tripToolsKey", () => {
  it("namespaces records by the page that hosts the trip", () => {
    expect(tripToolsKey({ kind: "shared", id: "abc" })).toBe(
      "trip-tools:shared:abc",
    );
    expect(tripToolsKey({ kind: "local", id: "abc" })).toBe("trip-tools:local:abc");
    expect(tripToolsKey({ kind: "demo" })).toBe("trip-tools:demo");
  });
});

describe("read/write trip tools", () => {
  const scope = { kind: "shared", id: "abc12345" } as const;

  it("round-trips ticks, custom items and notes", () => {
    const state = { checked: ["Power bank"], custom: ["Snorkel"], notes: "Gate B" };
    writeTripTools(scope, state);
    expect(readTripTools(scope)).toEqual(state);
  });

  it("reads missing, corrupt or invalid records as empty", () => {
    expect(readTripTools(scope)).toEqual(EMPTY_TRIP_TOOLS);
    window.localStorage.setItem(tripToolsKey(scope), "{nope");
    expect(readTripTools(scope)).toEqual(EMPTY_TRIP_TOOLS);
    window.localStorage.setItem(tripToolsKey(scope), JSON.stringify({ notes: 4 }));
    expect(readTripTools(scope)).toEqual(EMPTY_TRIP_TOOLS);
  });

  it("drops the record once it is empty, and on clear", () => {
    writeTripTools(scope, { ...EMPTY_TRIP_TOOLS, notes: "x" });
    writeTripTools(scope, EMPTY_TRIP_TOOLS);
    expect(window.localStorage.getItem(tripToolsKey(scope))).toBeNull();

    writeTripTools(scope, { ...EMPTY_TRIP_TOOLS, notes: "x" });
    clearTripTools(scope);
    expect(window.localStorage.getItem(tripToolsKey(scope))).toBeNull();
  });
});
