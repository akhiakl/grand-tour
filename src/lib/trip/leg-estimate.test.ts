import { describe, expect, it } from "vitest";

import { makeCity } from "@/test/fixtures/trip";

import {
  estimateLegDuration,
  legDistanceKm,
  suggestLeg,
  suggestLegMode,
} from "./leg-estimate";

const vienna = makeCity({ ll: [48.2082, 16.3738] });
const salzburg = makeCity({ ll: [47.8095, 13.055] });
const lisbon = makeCity({ ll: [38.7223, -9.1393] });
const unplaced = makeCity({ ll: [0, 0] });

describe("leg estimates", () => {
  it("suggests trains for short hops and flights for long ones", () => {
    expect(suggestLegMode(250)).toBe("train");
    expect(suggestLegMode(2300)).toBe("flight");
  });

  it("formats rounded durations", () => {
    expect(estimateLegDuration("train", 30)).toBe("~25m");
    expect(estimateLegDuration("train", 250)).toBe("~3h 30m");
    expect(estimateLegDuration("car", 0)).toBe("~5m");
    expect(estimateLegDuration("flight", 1500)).toBe("~2h 45m");
    expect(estimateLegDuration("bus", 300)).toBe("~6h");
  });

  it("drafts a leg between placed stops only", () => {
    expect(legDistanceKm(vienna, unplaced)).toBeNull();
    expect(suggestLeg(vienna, unplaced)).toEqual({
      mode: "train",
      label: "",
      duration: "",
    });

    expect(suggestLeg(vienna, salzburg)).toMatchObject({ mode: "train" });
    expect(suggestLeg(vienna, salzburg).duration).toMatch(/^~\d+h/);
    expect(suggestLeg(vienna, lisbon).mode).toBe("flight");
  });
});
