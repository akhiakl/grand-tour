import { beforeEach, describe, expect, it, vi } from "vitest";

import { GenerationError } from "@/lib/ai/generate";
import { makeTrip } from "@/test/trip-fixtures";

const mocks = vi.hoisted(() => ({
  limit: vi.fn(),
  generateTrip: vi.fn(),
}));

vi.mock("@/lib/ratelimit", () => ({
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

const validRequest = { destination: "Austria", days: 6, vibe: "balanced" };

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
    const res = await post(validRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.trip.title).toBe("Grand Tour");
    expect(body.suggestedExtra).toEqual([]);
  });

  it("returns 429 when the generate budget is exhausted", async () => {
    mocks.limit.mockResolvedValue({ success: false });
    const res = await post(validRequest);
    expect(res.status).toBe(429);
    expect(mocks.generateTrip).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON and invalid requests", async () => {
    expect((await post("{nope")).status).toBe(400);
    expect(
      (await post({ destination: "x", days: 6, vibe: "balanced" })).status,
    ).toBe(400);
  });

  it("maps unavailable to 503", async () => {
    mocks.generateTrip.mockRejectedValue(new GenerationError("unavailable"));
    const res = await post(validRequest);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "generation_unavailable" });
  });

  it("maps invalid model output to a clear 502", async () => {
    mocks.generateTrip.mockRejectedValue(new GenerationError("invalid_output"));
    const res = await post(validRequest);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "generation_failed" });
  });

  it("maps unexpected errors to 500", async () => {
    mocks.generateTrip.mockRejectedValue(new Error("boom"));
    expect((await post(validRequest)).status).toBe(500);
  });
});
