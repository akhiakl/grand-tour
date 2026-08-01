import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mapNominatimResults, searchCities } from "./nominatim";

const vienna = {
  lat: "48.2082",
  lon: "16.3738",
  display_name: "Vienna, Austria",
  address: { city: "Vienna", country: "Austria", country_code: "at" },
};

const parisTown = {
  lat: "48.8566",
  lon: "2.3522",
  display_name: "Paris, Île-de-France, France",
  address: { town: "Paris", country: "France", country_code: "fr" },
};

describe("mapNominatimResults", () => {
  it("maps a settlement-typed place into a city candidate", () => {
    expect(mapNominatimResults([vienna])).toEqual([
      {
        name: "Vienna",
        country: "Austria",
        flag: "🇦🇹",
        ll: [48.2082, 16.3738],
        displayName: "Vienna, Austria",
      },
    ]);
  });

  it("falls back through city/town/village/municipality/hamlet", () => {
    expect(mapNominatimResults([parisTown])[0].name).toBe("Paris");
  });

  it("drops places missing a settlement name, country, or country code", () => {
    expect(
      mapNominatimResults([{ ...vienna, address: { country: "Austria" } }]),
    ).toEqual([]);
    expect(mapNominatimResults([{ ...vienna, address: undefined }])).toEqual([]);
  });

  it("drops places with unparseable coordinates", () => {
    expect(mapNominatimResults([{ ...vienna, lat: "not-a-number" }])).toEqual([]);
  });

  it("deduplicates same name+country pairs", () => {
    expect(mapNominatimResults([vienna, { ...vienna, lat: "48.21" }])).toHaveLength(
      1,
    );
  });
});

describe("searchCities", () => {
  const fetchMock = vi.fn();

  // The module throttles real calls to 1/sec via setTimeout; fake timers +
  // runAllTimersAsync let each test resolve instantly instead of waiting
  // out that budget in wall-clock time.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([vienna]), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const runSearch = async (...args: Parameters<typeof searchCities>) => {
    const promise = searchCities(...args);
    // Silence the transient "unhandled rejection" Node reports while this
    // promise is in flight — the real assertion below still observes it.
    promise.catch(() => {});
    await vi.runAllTimersAsync();
    return promise;
  };

  it("returns [] without calling fetch for short queries", async () => {
    expect(await runSearch("v")).toEqual([]);
    expect(await runSearch(" ")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("queries Nominatim with jsonv2 + addressdetails and maps the response", async () => {
    const results = await runSearch("Vienna");

    expect(results).toEqual(mapNominatimResults([vienna]));
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(
      "https://nominatim.openstreetmap.org/search",
    );
    expect(url.searchParams.get("format")).toBe("jsonv2");
    expect(url.searchParams.get("q")).toBe("Vienna");
    expect(url.searchParams.get("addressdetails")).toBe("1");
  });

  it("respects a custom result limit", async () => {
    await runSearch("Vienna", { limit: 3 });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("limit")).toBe("3");
  });

  it("throws on a non-ok response", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 503 }));
    await expect(runSearch("Vienna")).rejects.toThrow(/503/);
  });

  it("forwards the abort signal", async () => {
    const controller = new AbortController();
    await runSearch("Vienna", { signal: controller.signal });
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });
});
