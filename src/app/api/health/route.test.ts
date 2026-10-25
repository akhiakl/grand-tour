import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ pingStore: vi.fn() }));
vi.mock("@/lib/trip/service", () => ({ pingStore: mocks.pingStore }));

import { GET } from "./route";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/health", () => {
  it("is 200 when the store answers, cached briefly at the CDN", async () => {
    mocks.pingStore.mockResolvedValue(true);
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", redis: "up" });
    // Caps Redis at a few pings a minute per region, however hard it is hit.
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=15");
  });

  it("is 503 when the store is down or too slow, never cached, so monitors alert", async () => {
    mocks.pingStore.mockResolvedValue(false);
    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "degraded", redis: "down" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
