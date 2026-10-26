import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ evaluate: vi.fn() }));
vi.mock("@vercel/flags-core", () => ({ flagsClient: { evaluate: mocks.evaluate } }));

import { GET, TESTER_FEEDBACK_FLAG } from "./route";

describe("GET /api/tester-feedback", () => {
  beforeEach(() => {
    mocks.evaluate.mockReset();
  });

  it("reports the flag value", async () => {
    mocks.evaluate.mockResolvedValue({ value: true });
    const response = await GET();

    expect(mocks.evaluate).toHaveBeenCalledWith(TESTER_FEEDBACK_FLAG, false);
    expect(await response.json()).toEqual({ enabled: true });
  });

  it("stays off when flags are unavailable", async () => {
    mocks.evaluate.mockRejectedValue(new Error("no sdk key"));
    const response = await GET();

    expect(await response.json()).toEqual({ enabled: false });
  });
});
