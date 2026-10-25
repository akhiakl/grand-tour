import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeSpanRecorder } from "@/test/fixtures/sentry";
import { makeTrip } from "@/test/fixtures/trip";

const redisMock = vi.hoisted(() => ({
  setex: vi.fn(),
  getex: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  ping: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn(() => redisMock) },
}));

const recorder = makeSpanRecorder();
// The factory runs lazily, so it can close over the recorder defined above.
vi.mock("@sentry/nextjs", () => ({
  startSpan: (...args: Parameters<typeof recorder.startSpan>) =>
    recorder.startSpan(...args),
}));

import {
  TRIP_ID_LENGTH,
  TRIP_TTL_SECONDS,
  getTrip,
  incrViews,
  pingStore,
  saveTrip,
} from "./service";

beforeEach(() => {
  vi.clearAllMocks();
  recorder.spans.length = 0;
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

describe("tracing", () => {
  it("wraps each store call in a db.redis span without trip data", async () => {
    redisMock.getex.mockResolvedValue(null);
    redisMock.incr.mockResolvedValue(1);
    await saveTrip(makeTrip());
    await getTrip("abc12345");
    await incrViews("abc12345");

    expect(recorder.spans.map((span) => [span.name, span.op])).toEqual([
      ["redis.save_trip", "db.redis"],
      ["redis.get_trip", "db.redis"],
      ["redis.incr_views", "db.redis"],
    ]);
    for (const span of recorder.spans) expect(span.attributes).toEqual({});
  });
});

describe("pingStore", () => {
  afterEach(() => vi.useRealTimers());

  it("is true when Redis answers PONG", async () => {
    redisMock.ping.mockResolvedValue("PONG");
    await expect(pingStore()).resolves.toBe(true);
  });

  it("is false when Redis errors", async () => {
    redisMock.ping.mockRejectedValue(new Error("down"));
    await expect(pingStore()).resolves.toBe(false);
  });

  it("is false when Redis hangs past the timeout", async () => {
    vi.useFakeTimers();
    redisMock.ping.mockReturnValue(new Promise(() => {}));
    const result = pingStore(500);
    await vi.advanceTimersByTimeAsync(500);
    await expect(result).resolves.toBe(false);
  });
});
