import { beforeEach, describe, expect, it } from "vitest";

import { makeAiTrip } from "@/test/fixtures/ai";

import { readAndClearAiHandoff, writeAiHandoff } from "./handoff";

describe("AI handoff", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a written trip and clears it after one read", () => {
    const trip = makeAiTrip();
    writeAiHandoff(trip);

    expect(readAndClearAiHandoff()).toEqual(trip);
    expect(readAndClearAiHandoff()).toBeNull();
  });

  it("returns null when nothing was handed off", () => {
    expect(readAndClearAiHandoff()).toBeNull();
  });

  it("clears and returns null for a corrupt payload", () => {
    window.localStorage.setItem("trips:ai-handoff", "not json");
    expect(readAndClearAiHandoff()).toBeNull();
    expect(window.localStorage.getItem("trips:ai-handoff")).toBeNull();
  });

  it("returns null for a payload that fails schema validation", () => {
    window.localStorage.setItem("trips:ai-handoff", JSON.stringify({ nope: true }));
    expect(readAndClearAiHandoff()).toBeNull();
  });
});
