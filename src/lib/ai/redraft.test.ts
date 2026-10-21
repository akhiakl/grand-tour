import { describe, expect, it } from "vitest";

import { makeGenerateRequest } from "@/test/fixtures/ai";
import { makeCity } from "@/test/fixtures/trip";

import { redraftDefaults } from "./redraft";

describe("redraftDefaults", () => {
  it("keeps the original chat answers when known", () => {
    const previous = makeGenerateRequest({ vibe: "packed" });
    expect(redraftDefaults({ title: "x", cities: [] }, previous)).toBe(previous);
  });

  it("derives a request from the draft's stops and nights", () => {
    expect(
      redraftDefaults({
        title: "Alps",
        cities: [
          makeCity({ name: "Vienna", nights: 3 }),
          makeCity({ name: "Graz", nights: 2 }),
        ],
      }),
    ).toEqual({ destination: "Vienna, Graz", days: 6, vibe: "balanced" });
  });

  it("clamps days and falls back to the title, within limits", () => {
    expect(redraftDefaults({ title: "Somewhere", cities: [] })).toEqual({
      destination: "Somewhere",
      days: 2,
      vibe: "balanced",
    });
    const long = redraftDefaults({
      title: "x",
      cities: Array.from({ length: 5 }, (_, i) =>
        makeCity({ name: "A".repeat(40) + i, nights: 30 }),
      ),
    });
    expect(long.days).toBe(30);
    expect(long.destination).toHaveLength(120);
  });
});
