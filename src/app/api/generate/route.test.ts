import { beforeEach, describe, expect, it, vi } from "vitest";

import { GenerationError } from "@/lib/ai/generate";
import { makeGenerateRequest } from "@/test/fixtures/ai";
import { makeTrip } from "@/test/fixtures/trip";

const mocks = vi.hoisted(() => ({
  limit: vi.fn(),
  generateTrip: vi.fn(),
  emit: vi.fn(),
}));

vi.mock("@/lib/logging", () => ({ emit: mocks.emit }));

vi.mock("@/lib/http", () => ({
  getRatelimiter: () => ({ limit: mocks.limit }),
  getClientIp: () => "203.0.113.9",
}));

vi.mock("@/lib/ai/generate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/generate")>()),
  generateTrip: mocks.generateTrip,
}));

import { POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.limit.mockResolvedValue({ success: true });
  mocks.generateTrip.mockResolvedValue({
    trip: makeTrip(),
    suggestedExtra: [],
  });
});

describe("POST /api/generate", () => {
  it("returns the generated trip without saving it", async () => {
    const res = await post(makeGenerateRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.trip.title).toBe("Grand Tour");
    expect(body.suggestedExtra).toEqual([]);
  });

  it("returns 429 when the generate budget is exhausted", async () => {
    mocks.limit.mockResolvedValue({ success: false });
    const res = await post(makeGenerateRequest());
    expect(res.status).toBe(429);
    expect(mocks.generateTrip).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON and invalid requests", async () => {
    expect((await post("{nope")).status).toBe(400);
    expect((await post(makeGenerateRequest({ destination: "x" }))).status).toBe(400);
  });

  it("maps unavailable to 503", async () => {
    mocks.generateTrip.mockRejectedValue(new GenerationError("unavailable"));
    const res = await post(makeGenerateRequest());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "generation_unavailable" });
  });

  it("maps invalid model output to a clear 502", async () => {
    mocks.generateTrip.mockRejectedValue(new GenerationError("invalid_output"));
    const res = await post(makeGenerateRequest());
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "generation_failed" });
  });

  it("logs a generated trip without the prompt or the result", async () => {
    await post(makeGenerateRequest());
    expect(mocks.emit).toHaveBeenCalledWith("info", "trip generated", {
      route: "/api/generate",
    });
  });

  it("logs a refused request by reason only", async () => {
    mocks.limit.mockResolvedValue({ success: false });
    await post(makeGenerateRequest());
    expect(mocks.emit).toHaveBeenCalledWith("warn", "request refused", {
      route: "/api/generate",
      status: 429,
      reason: "rate_limited",
    });
  });

  it("logs a malformed body by reason only", async () => {
    await post("not json");
    expect(mocks.emit).toHaveBeenCalledWith("warn", "request refused", {
      route: "/api/generate",
      status: 400,
      reason: "invalid_json",
    });
  });

  it("logs why generation failed without the request contents", async () => {
    mocks.generateTrip.mockRejectedValue(new GenerationError("unavailable"));
    await post(makeGenerateRequest());
    expect(mocks.emit).toHaveBeenCalledWith("error", "generation failed", {
      route: "/api/generate",
      status: 503,
      reason: "unavailable",
    });
  });

  it("logs the model endpoint's HTTP status on an upstream failure", async () => {
    mocks.generateTrip.mockRejectedValue(new GenerationError("upstream", 401));
    await post(makeGenerateRequest());
    expect(mocks.emit).toHaveBeenCalledWith("error", "generation failed", {
      route: "/api/generate",
      status: 502,
      reason: "upstream",
      upstreamStatus: 401,
    });
  });

  it("logs an unexpected error as unexpected, never its message", async () => {
    mocks.generateTrip.mockRejectedValue(new Error("boom with the user prompt"));
    await post(makeGenerateRequest());
    expect(mocks.emit).toHaveBeenCalledWith("error", "generation failed", {
      route: "/api/generate",
      status: 500,
      reason: "unexpected",
    });
  });

  it("maps unexpected errors to 500", async () => {
    mocks.generateTrip.mockRejectedValue(new Error("boom"));
    expect((await post(makeGenerateRequest())).status).toBe(500);
  });
});
