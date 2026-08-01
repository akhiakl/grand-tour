import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import { shareTrip } from "./share";

const trip = makeTrip();
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("shareTrip", () => {
  it("posts the trip and returns the new id on 201", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { id: "abc123" }));

    const outcome = await shareTrip(trip);

    expect(outcome).toEqual({ kind: "success", id: "abc123" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/trips",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.title).toBe(trip.title);
  });

  it("maps 403 city_limit into a city_limit outcome", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(403, { error: "city_limit", limit: 5 }),
    );

    expect(await shareTrip(trip)).toEqual({ kind: "city_limit", limit: 5 });
  });

  it("maps 413 into an in-voice error message", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(413, { error: "payload_too_large" }),
    );

    const outcome = await shareTrip(trip);
    expect(outcome.kind).toBe("error");
    expect(outcome).toMatchObject({ kind: "error" });
  });

  it("maps 429 into an in-voice error message", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(429, { error: "rate_limited" }));
    expect((await shareTrip(trip)).kind).toBe("error");
  });

  it("maps 500 into an in-voice error message", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { error: "save_failed" }));
    expect((await shareTrip(trip)).kind).toBe("error");
  });

  it("falls back to a default message for an unmapped status", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { error: "invalid_trip" }));
    const outcome = await shareTrip(trip);
    expect(outcome).toMatchObject({ kind: "error" });
  });

  it("returns an error outcome when the network call throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    expect((await shareTrip(trip)).kind).toBe("error");
  });
});
