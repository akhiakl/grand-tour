import { describe, expect, it } from "vitest";

import { GUEST_MAX_CITIES } from "@/lib/trip";

import { buildRetryPrompt, buildSystemPrompt, buildUserPrompt } from "./prompt";

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt();

  it("states the guest city ceiling and suggestedExtra overflow rule", () => {
    expect(prompt).toContain(`At most ${GUEST_MAX_CITIES} cities`);
    expect(prompt).toContain("suggestedExtra");
  });

  it("pins the structural rules the schema will enforce", () => {
    expect(prompt).toContain("legs.length must equal cities.length - 1");
    expect(prompt).toContain("[latitude, longitude]");
    expect(prompt).toContain("never invent places");
  });
});

describe("buildUserPrompt", () => {
  it("carries all three guided answers", () => {
    const prompt = buildUserPrompt({
      destination: "Portugal",
      days: 10,
      vibe: "relaxed",
    });
    expect(prompt).toContain("Portugal");
    expect(prompt).toContain("10 days");
    expect(prompt).toContain("relaxed");
  });
});

describe("buildRetryPrompt", () => {
  it("feeds validation issues back verbatim", () => {
    const prompt = buildRetryPrompt("cities.0.ll: expected tuple");
    expect(prompt).toContain("cities.0.ll: expected tuple");
    expect(prompt).toContain("corrected JSON");
  });
});
