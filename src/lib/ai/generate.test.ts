import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeCity, makeLeg } from "@/test/trip-fixtures";
import { GenerationError, generateTrip } from "./generate";
import type { GenerateRequest } from "./schema";

const request: GenerateRequest = {
  destination: "Austria",
  days: 6,
  vibe: "balanced",
};

const validAiOutput = {
  title: "Alpine Arc",
  cities: [makeCity(), makeCity({ name: "Salzburg" })],
  legs: [makeLeg()],
  suggestedExtra: ["Innsbruck"],
};

const groqResponse = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GROQ_API_KEY", "test-key");
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("generateTrip", () => {
  it("throws unavailable without an api key, before any network call", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    await expect(generateTrip(request)).rejects.toMatchObject({
      reason: "unavailable",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a full Trip plus suggestedExtra on first-try success", async () => {
    fetchMock.mockResolvedValueOnce(groqResponse(JSON.stringify(validAiOutput)));

    const result = await generateTrip(request);

    expect(result.trip.v).toBe(1);
    expect(result.trip.createdBy).toBe("guest");
    expect(result.trip.cities).toHaveLength(2);
    expect(result.suggestedExtra).toEqual(["Innsbruck"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("llama-3.3-70b-versatile");
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("retries once, feeding validation errors back to the model", async () => {
    const invalid = JSON.stringify({ ...validAiOutput, legs: [] });
    fetchMock
      .mockResolvedValueOnce(groqResponse(invalid))
      .mockResolvedValueOnce(groqResponse(JSON.stringify(validAiOutput)));

    const result = await generateTrip(request);

    expect(result.trip.cities).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const retryBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    const retryMessages = retryBody.messages;
    expect(retryMessages.at(-2).role).toBe("assistant");
    expect(retryMessages.at(-1).content).toContain("legs");
  });

  it("throws invalid_output after a second validation failure", async () => {
    fetchMock
      .mockResolvedValueOnce(groqResponse("not json at all"))
      .mockResolvedValueOnce(groqResponse("still not json"));

    await expect(generateTrip(request)).rejects.toMatchObject({
      reason: "invalid_output",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws upstream on a non-ok Groq response", async () => {
    fetchMock.mockResolvedValueOnce(new Response("rate limited", { status: 429 }));

    const error = await generateTrip(request).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GenerationError);
    expect((error as GenerationError).reason).toBe("upstream");
  });
});
