import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { searchCities } from "./nominatim";

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: () => Promise.resolve(body),
  }) as Response;

// Each call self-throttles against a module-level "last request" timestamp,
// so tests advance the fake clock far ahead every run to stay clear of the
// previous test's throttle window (the dedicated throttle test below is the
// only one that exercises the wait itself).
let fakeNow = Date.parse("2024-01-01T00:00:00Z");

describe("searchCities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fakeNow += 60_000;
    vi.setSystemTime(fakeNow);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns an empty array without calling fetch for a too-short query", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("a")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("builds the Nominatim URL and maps results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          lat: "48.2082",
          lon: "16.3738",
          display_name: "Vienna, Austria",
          address: { city: "Vienna", country: "Austria", country_code: "at" },
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchCities("Vienna");

    expect(results).toEqual([
      {
        name: "Vienna",
        country: "Austria",
        flag: "🇦🇹",
        ll: [48.2082, 16.3738],
        displayName: "Vienna, Austria",
      },
    ]);

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.origin + calledUrl.pathname).toBe(
      "https://nominatim.openstreetmap.org/search",
    );
    expect(calledUrl.searchParams.get("q")).toBe("Vienna");
    expect(calledUrl.searchParams.get("format")).toBe("jsonv2");
  });

  it("falls back to the display name's first segment when address fields are missing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse([{ lat: "1", lon: "2", display_name: "Somewhere, Nowhere" }]),
      );
    vi.stubGlobal("fetch", fetchMock);

    const [result] = await searchCities("Somewhere");
    expect(result.name).toBe("Somewhere");
    expect(result.country).toBe("");
    expect(result.flag).toBe("");
  });

  it("skips entries that fail schema validation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse([{ lat: "1" }, { not: "valid" }]));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("Vi")).resolves.toEqual([]);
  });

  it("returns an empty array when the response body isn't an array", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: "nope" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("Vi")).resolves.toEqual([]);
  });

  it("throws on a non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([], false, 503));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("Vienna")).rejects.toThrow("nominatim_error_503");
  });

  it("throttles a second call to at least one second after the first", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    const first = searchCities("Vienna");
    await vi.runAllTimersAsync();
    await first;

    const secondStart = Date.now();
    const second = searchCities("Berlin");
    await vi.runAllTimersAsync();
    await second;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(Date.now() - secondStart).toBeGreaterThanOrEqual(1000);
  });
});
