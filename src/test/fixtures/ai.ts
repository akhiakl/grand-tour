import type { AiTrip, GenerateRequest } from "@/lib/ai";

import { makeCity, makeLeg } from "./trip";

/** Builders for AI-generation inputs/outputs shared across unit tests. */

export const makeGenerateRequest = (
  overrides: Partial<GenerateRequest> = {},
): GenerateRequest => ({
  destination: "Austria",
  days: 6,
  vibe: "balanced",
  ...overrides,
});

export const makeAiTrip = (
  cityCount = 2,
  overrides: Partial<AiTrip> = {},
): AiTrip => ({
  title: "Alpine Arc",
  cities: Array.from({ length: cityCount }, (_, i) =>
    makeCity(i === 0 ? {} : { name: `Stop ${i + 1}` }),
  ),
  legs: Array.from({ length: cityCount - 1 }, () => makeLeg()),
  suggestedExtra: [],
  ...overrides,
});
