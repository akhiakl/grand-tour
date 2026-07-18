import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

const redisMock = vi.hoisted(() => ({
  setex: vi.fn(),
  getex: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn(() => redisMock) },
}));

import {
  TRIP_ID_LENGTH,
  TRIP_TTL_SECONDS,
  getTrip,
  incrViews,
  saveTrip,
} from "./service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveTrip", () => {
  it("stores the snapshot under trip:{id} with the 60-day TTL", async () => {
    const trip = makeTrip();
    const id = await saveTrip(trip);

    expect(id).toHaveLength(TRIP_ID_LENGTH);
    expect(redisMock.setex).toHaveBeenCalledWith(
      `trip:${id}`,
      TRIP_TTL_SECONDS,
      trip,
    );
  });

  it("generates a fresh id per save", async () => {
    const first = await saveTrip(makeTrip());
    const second = await saveTrip(makeTrip());
    expect(first).not.toBe(second);
  });

  it("rejects invalid trips before touching redis", async () => {
    const invalid = makeTrip(1); // below the two-city minimum
    await expect(saveTrip(invalid)).rejects.toThrow();
    expect(redisMock.setex).not.toHaveBeenCalled();
  });
});

describe("getTrip", () => {
  it("reads via GETEX, refreshing the sliding TTL", async () => {
    const trip = makeTrip();
    redisMock.getex.mockResolvedValueOnce(trip);

    const result = await getTrip("abc12345");

    expect(redisMock.getex).toHaveBeenCalledWith("trip:abc12345", {
      ex: TRIP_TTL_SECONDS,
    });
    expect(result).toEqual(trip);
  });

  it("returns null for missing snapshots", async () => {
    redisMock.getex.mockResolvedValueOnce(null);
    expect(await getTrip("missing1")).toBeNull();
  });

  it("returns null for corrupt stored data instead of throwing", async () => {
    redisMock.getex.mockResolvedValueOnce({ nonsense: true });
    expect(await getTrip("corrupt1")).toBeNull();
  });
});

describe("incrViews", () => {
  it("increments views:{id} and re-arms its expiry", async () => {
    redisMock.incr.mockResolvedValueOnce(7);

    const views = await incrViews("abc12345");

    expect(views).toBe(7);
    expect(redisMock.incr).toHaveBeenCalledWith("views:abc12345");
    expect(redisMock.expire).toHaveBeenCalledWith(
      "views:abc12345",
      TRIP_TTL_SECONDS,
    );
  });
});
