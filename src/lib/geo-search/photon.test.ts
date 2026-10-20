import { afterEach, describe, expect, it, vi } from "vitest";

import { makePhotonFeature, makePhotonResponse } from "@/test/fixtures/geo-search";

import { searchCities } from "./photon";

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: () => Promise.resolve(body),
  }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchCities", () => {
  it("returns an empty array without calling fetch for a too-short query", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities(" a ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("builds the Photon URL and maps features to results", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(makePhotonResponse()));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    const results = await searchCities(" Vienna ", { signal: controller.signal });

    expect(results).toEqual([
      {
        name: "Vienna",
        country: "Austria",
        flag: "🇦🇹",
        ll: [48.2082, 16.3738],
        displayName: "Vienna, Vienna, Austria",
      },
    ]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url.origin + url.pathname).toBe("https://photon.komoot.io/api/");
    expect(url.searchParams.get("q")).toBe("Vienna");
    expect(url.searchParams.get("limit")).toBe("8");
    expect(url.searchParams.getAll("layer")).toEqual(["city", "locality"]);
    expect(init.signal).toBe(controller.signal);
  });

  it("tolerates missing country, code and state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          makePhotonResponse([
            makePhotonFeature({
              name: "Nowhere",
              country: undefined,
              countrycode: undefined,
              state: undefined,
            }),
          ]),
        ),
      ),
    );

    const [result] = await searchCities("Nowhere");

    expect(result).toMatchObject({ country: "", flag: "", displayName: "Nowhere" });
  });

  it("skips features that fail schema validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            makePhotonResponse([{ properties: {} }, makePhotonFeature()]),
          ),
        ),
    );

    await expect(searchCities("Vienna")).resolves.toHaveLength(1);
  });

  it("returns an empty array when the body has no features array", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({})));

    await expect(searchCities("Vienna")).resolves.toEqual([]);
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false, 503)));

    await expect(searchCities("Vienna")).rejects.toThrow("photon_error_503");
  });
});
