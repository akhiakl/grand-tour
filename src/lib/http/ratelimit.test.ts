import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const slidingWindow = vi.fn(() => "sliding-window-config");
  const RatelimitCtor = vi.fn(function (
    this: Record<string, unknown>,
    config: unknown,
  ) {
    this.config = config;
  });
  return { slidingWindow, RatelimitCtor };
});

vi.mock("@upstash/ratelimit", () => {
  const Ratelimit = mocks.RatelimitCtor as unknown as {
    slidingWindow: typeof mocks.slidingWindow;
  };
  Ratelimit.slidingWindow = mocks.slidingWindow;
  return { Ratelimit };
});

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn(() => ({ kind: "redis-client" })) },
}));

import { getClientIp, getRatelimiter } from "./ratelimit";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getRatelimiter", () => {
  it("configures trips as a 10/hour sliding window with its own prefix", () => {
    getRatelimiter("trips");
    expect(mocks.slidingWindow).toHaveBeenCalledWith(10, "1 h");
    expect(mocks.RatelimitCtor).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: "rl:trips", analytics: false }),
    );
  });

  it("configures generate as a 5/hour sliding window", () => {
    getRatelimiter("generate");
    expect(mocks.slidingWindow).toHaveBeenCalledWith(5, "1 h");
    expect(mocks.RatelimitCtor).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: "rl:generate" }),
    );
  });

  it("caches limiters per name", () => {
    const first = getRatelimiter("trips");
    const again = getRatelimiter("trips");
    expect(again).toBe(first);
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost/api", { headers });

  it("uses the first x-forwarded-for entry", () => {
    expect(getClientIp(req({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe(
      "203.0.113.9",
    );
  });

  it("trims whitespace around forwarded entries", () => {
    expect(getClientIp(req({ "x-forwarded-for": "  203.0.113.9  " }))).toBe(
      "203.0.113.9",
    );
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(req({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("defaults to localhost when no headers are present", () => {
    expect(getClientIp(req({}))).toBe("127.0.0.1");
  });
});
