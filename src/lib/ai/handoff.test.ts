import { beforeEach, describe, expect, it } from "vitest";

import { makeAiTrip } from "@/test/fixtures/ai";

import { clearAiHandoff, readAiHandoff, writeAiHandoff } from "./handoff";

describe("AI handoff", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a written trip and survives repeated reads until cleared", () => {
    const trip = makeAiTrip();
    writeAiHandoff(trip);

    expect(readAiHandoff()).toEqual(trip);
    expect(readAiHandoff()).toEqual(trip);

    clearAiHandoff();
    expect(readAiHandoff()).toBeNull();
  });

  it("returns null when nothing was handed off", () => {
    expect(readAiHandoff()).toBeNull();
  });

  it("returns null for a corrupt payload", () => {
    window.localStorage.setItem("trips:ai-handoff", "not json");
    expect(readAiHandoff()).toBeNull();
  });

  it("returns null for a payload that fails schema validation", () => {
    window.localStorage.setItem("trips:ai-handoff", JSON.stringify({ nope: true }));
    expect(readAiHandoff()).toBeNull();
  });
});
