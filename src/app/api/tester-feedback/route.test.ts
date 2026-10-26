import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ testerFeedback: vi.fn() }));
vi.mock("@/flags", () => ({ testerFeedback: mocks.testerFeedback }));

import { GET } from "./route";

describe("GET /api/tester-feedback", () => {
  beforeEach(() => {
    mocks.testerFeedback.mockReset();
  });

  it("reports the flag value", async () => {
    mocks.testerFeedback.mockResolvedValue(true);
    const response = await GET();

    expect(await response.json()).toEqual({ enabled: true });
  });

  it("stays off when flags are unavailable", async () => {
    mocks.testerFeedback.mockRejectedValue(new Error("no credentials"));
    const response = await GET();

    expect(await response.json()).toEqual({ enabled: false });
  });
});
