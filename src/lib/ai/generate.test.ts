import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeAiTrip, makeGenerateRequest } from "@/test/fixtures/ai";
import { makeSpanRecorder } from "@/test/fixtures/sentry";

const recorder = makeSpanRecorder();
// The factory runs lazily, so it can close over the recorder defined above.
vi.mock("@sentry/nextjs", () => ({
  startSpan: (...args: Parameters<typeof recorder.startSpan>) =>
    recorder.startSpan(...args),
}));
const spans = () => recorder.spans;

const emit = vi.hoisted(() => vi.fn());
vi.mock("@/lib/logging", () => ({
  emit,
  errorFields: (error: Error) => ({ errorName: error.name }),
}));

import { GenerationError, generateTrip } from "./generate";

const request = makeGenerateRequest();
const validAiOutput = makeAiTrip(2, { suggestedExtra: ["Innsbruck"] });

const modelResponse = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("AI_BASE_URL", "http://ai.test/v1/");
  vi.stubEnv("AI_MODEL", "test-model");
  vi.stubEnv("AI_API_KEY", "test-key");
  fetchMock.mockReset();
  spans().length = 0;
  emit.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("generateTrip", () => {
  it.each(["AI_BASE_URL", "AI_MODEL"])(
    "throws unavailable without %s, before any network call",
    async (name) => {
      vi.stubEnv(name, "");
      await expect(generateTrip(request)).rejects.toMatchObject({
        reason: "unavailable",
      });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("omits the authorization header when no api key is set", async () => {
    vi.stubEnv("AI_API_KEY", "");
    fetchMock.mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));

    await generateTrip(request);

    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("authorization");
  });

  it("returns a full Trip plus suggestedExtra on first-try success", async () => {
    fetchMock.mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));

    const result = await generateTrip(request);

    expect(result.trip.v).toBe(1);
    expect(result.trip.createdBy).toBe("guest");
    expect(result.trip.cities).toHaveLength(2);
    expect(result.suggestedExtra).toEqual(["Innsbruck"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://ai.test/v1/chat/completions");
    expect(init.headers.authorization).toBe("Bearer test-key");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("test-model");
    expect(body.response_format).toEqual({ type: "json_object" });
  });

  it("retries once, feeding validation errors back to the model", async () => {
    const invalid = JSON.stringify(makeAiTrip(2, { legs: [] }));
    fetchMock
      .mockResolvedValueOnce(modelResponse(invalid))
      .mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));

    const result = await generateTrip(request);

    expect(result.trip.cities).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const retryMessages = JSON.parse(fetchMock.mock.calls[1][1].body).messages;
    expect(retryMessages.at(-2).role).toBe("assistant");
    expect(retryMessages.at(-1).content).toContain("legs");
  });

  it("throws invalid_output after a second validation failure", async () => {
    fetchMock
      .mockResolvedValueOnce(modelResponse("not json at all"))
      .mockResolvedValueOnce(modelResponse("still not json"));

    await expect(generateTrip(request)).rejects.toMatchObject({
      reason: "invalid_output",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries once when the provider rejects its own malformed JSON", async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json({ error: { code: "json_validate_failed" } }, { status: 400 }),
      )
      .mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));

    const result = await generateTrip(request);

    expect(result.trip.cities).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry other upstream errors", async () => {
    fetchMock.mockResolvedValueOnce(new Response("bad", { status: 400 }));

    await expect(generateTrip(request)).rejects.toMatchObject({
      reason: "upstream",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws upstream on a non-ok model response", async () => {
    fetchMock.mockResolvedValueOnce(new Response("rate limited", { status: 429 }));

    const error = await generateTrip(request).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GenerationError);
    expect((error as GenerationError).reason).toBe("upstream");
    expect((error as GenerationError).upstreamStatus).toBe(429);
  });

  describe("tracing", () => {
    // Prompts, destinations and model output are guest content: never span data.
    const ALLOWED = [
      "ai.model",
      "trip.days",
      "ai.attempts",
      "ai.outcome",
      "trip.cities",
      "ai.attempt",
    ];

    it("records one generation span with model, attempts and outcome", async () => {
      fetchMock.mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));
      await generateTrip(request);

      const [generation, ...calls] = spans();
      expect(generation).toMatchObject({
        name: "ai.generate_trip",
        attributes: {
          "ai.model": "test-model",
          "trip.days": request.days,
          "ai.attempts": 1,
          "ai.outcome": "ok",
          "trip.cities": 2,
        },
      });
      expect(calls).toHaveLength(1);
      expect(calls[0]).toMatchObject({
        name: "ai.chat_completion",
        attributes: { "ai.attempt": 1 },
      });
    });

    it("records the failure reason and still throws it", async () => {
      fetchMock.mockResolvedValueOnce(new Response("nope", { status: 502 }));
      await expect(generateTrip(request)).rejects.toBeInstanceOf(GenerationError);
      expect(spans()[0].attributes).toMatchObject({
        "ai.outcome": "upstream",
        "ai.attempts": 1,
      });
    });

    it("records a network failure as an upstream outcome", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
      await expect(generateTrip(request)).rejects.toThrow(
        "generation failed: upstream",
      );
      expect(spans()[0].attributes["ai.outcome"]).toBe("upstream");
    });

    it("counts the retry", async () => {
      fetchMock
        .mockResolvedValueOnce(modelResponse("not json"))
        .mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));
      await generateTrip(request);
      expect(spans()[0].attributes["ai.attempts"]).toBe(2);
      expect(
        spans().filter((span) => span.name === "ai.chat_completion"),
      ).toHaveLength(2);
    });

    it("sends only allowlisted attributes, never guest content", async () => {
      fetchMock.mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));
      await generateTrip(request);
      for (const span of spans()) {
        for (const key of Object.keys(span.attributes))
          expect(ALLOWED).toContain(key);
        expect(JSON.stringify(span.attributes)).not.toContain(request.destination);
      }
    });
  });

  describe("diagnostic logs", () => {
    it("logs the provider's status and error code, never its message", async () => {
      fetchMock.mockImplementation(async () =>
        Response.json(
          { error: { code: "json_validate_failed", message: "secret prompt echo" } },
          { status: 400 },
        ),
      );
      await expect(generateTrip(request)).rejects.toMatchObject({
        reason: "upstream",
        upstreamStatus: 400,
      });
      expect(emit).toHaveBeenCalledWith(
        "error",
        "model call failed",
        expect.objectContaining({
          model: "test-model",
          detail: "http_status",
          upstreamStatus: 400,
          upstreamCode: "json_validate_failed",
          durationMs: expect.any(Number),
        }),
      );
      expect(JSON.stringify(emit.mock.calls)).not.toContain("secret prompt echo");
    });

    it("logs a network failure with the error name", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
      await expect(generateTrip(request)).rejects.toThrow();
      expect(emit).toHaveBeenCalledWith(
        "error",
        "model call failed",
        expect.objectContaining({ detail: "network", errorName: "TypeError" }),
      );
    });

    it("logs an unreadable body and a reply without content", async () => {
      fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 200 }));
      await expect(generateTrip(request)).rejects.toThrow();
      fetchMock.mockResolvedValueOnce(Response.json({ choices: [] }));
      await expect(generateTrip(request)).rejects.toThrow();
      const details = emit.mock.calls.map((call) => call[2].detail);
      expect(details).toEqual(["body_not_json", "no_content"]);
    });

    it("logs a rejected first output as a warning and a second as an error", async () => {
      fetchMock.mockImplementation(async () => modelResponse("not json"));
      await expect(generateTrip(request)).rejects.toThrow();
      expect(emit.mock.calls.map((call) => [call[0], call[1]])).toEqual([
        ["warn", "model output rejected, retrying"],
        ["error", "model output rejected twice"],
      ]);
    });
  });

  describe("optional model parameters", () => {
    const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

    it("sends reasoning effort and the token cap only when configured", async () => {
      vi.stubEnv("AI_REASONING_EFFORT", "low");
      vi.stubEnv("AI_MAX_TOKENS", "8000");
      fetchMock.mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));
      await generateTrip(request);
      expect(sentBody()).toMatchObject({
        reasoning_effort: "low",
        max_completion_tokens: 8000,
      });
    });

    it("leaves both out when unset or invalid", async () => {
      vi.stubEnv("AI_MAX_TOKENS", "lots");
      fetchMock.mockResolvedValueOnce(modelResponse(JSON.stringify(validAiOutput)));
      await generateTrip(request);
      expect(sentBody()).not.toHaveProperty("reasoning_effort");
      expect(sentBody()).not.toHaveProperty("max_completion_tokens");
    });
  });
});
