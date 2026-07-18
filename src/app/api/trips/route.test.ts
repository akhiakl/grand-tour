import { beforeEach, describe, expect, it, vi } from "vitest";

import { GUEST_MAX_CITIES } from "@/lib/trip";
import { makeTrip } from "@/test/fixtures/trip";

const mocks = vi.hoisted(() => ({
  limit: vi.fn(),
  saveTrip: vi.fn(),
}));

vi.mock("@/lib/http", () => ({
  getRatelimiter: () => ({ limit: mocks.limit }),
  getClientIp: () => "203.0.113.9",
}));

vi.mock("@/lib/trip/service", () => ({
  saveTrip: mocks.saveTrip,
}));

import { POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/trips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.limit.mockResolvedValue({ success: true });
  mocks.saveTrip.mockResolvedValue("abc12345");
});

describe("POST /api/trips", () => {
  it("saves a valid trip and returns its id", async () => {
    const res = await post(makeTrip());
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "abc12345" });
    expect(mocks.saveTrip).toHaveBeenCalledOnce();
  });

  it("returns 429 when the rate limit is exhausted", async () => {
    mocks.limit.mockResolvedValue({ success: false });
    const res = await post(makeTrip());
    expect(res.status).toBe(429);
    expect(mocks.saveTrip).not.toHaveBeenCalled();
  });

  it("returns the city_limit contract for over-limit trips", async () => {
    const res = await post(makeTrip(GUEST_MAX_CITIES + 1));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "city_limit",
      limit: GUEST_MAX_CITIES,
    });
    expect(mocks.saveTrip).not.toHaveBeenCalled();
  });

  it("returns 413 for payloads over the 50KB cap", async () => {
    const bloated = makeTrip(2, { title: "x".repeat(80) });
    const oversized = {
      ...bloated,
      cities: bloated.cities.map((c) => ({ ...c, why: "y".repeat(30000) })),
    };
    const res = await post(oversized);
    expect(res.status).toBe(413);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "invalid_json" });
  });

  it("returns 400 with issue paths for invalid trips", async () => {
    const res = await post({ ...makeTrip(), title: "" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_trip");
    expect(body.issues[0].path).toBe("title");
  });

  it("returns 500 when persistence fails", async () => {
    mocks.saveTrip.mockRejectedValue(new Error("redis down"));
    const res = await post(makeTrip());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "save_failed" });
  });
});
