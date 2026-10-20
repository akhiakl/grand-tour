import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeFrankfurterResponse } from "@/test/fixtures/units";

import { GET } from "./route";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const upstream = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("GET /api/rates", () => {
  it("returns USD-based rates with a daily shared cache", async () => {
    fetchMock.mockResolvedValue(upstream(makeFrankfurterResponse()));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      base: "USD",
      date: "2026-10-20",
      rates: { EUR: 0.9, GBP: 0.8, JPY: 150 },
    });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=86400");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.frankfurter.dev/v1/latest?base=USD",
      { next: { revalidate: 86400 } },
    );
  });

  it("honours RATES_API_URL", async () => {
    vi.stubEnv("RATES_API_URL", "https://rates.example.test/latest?base=USD");
    fetchMock.mockResolvedValue(upstream(makeFrankfurterResponse()));

    await GET();
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://rates.example.test/latest?base=USD",
    );
  });

  it.each([
    ["an upstream error", () => upstream({}, 500)],
    ["a non-USD base", () => upstream(makeFrankfurterResponse({ base: "EUR" }))],
    ["a network failure", () => Promise.reject(new Error("offline"))],
  ])("answers 503 on %s", async (_, reply) => {
    fetchMock.mockImplementation(reply);

    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "rates_unavailable" });
  });
});
