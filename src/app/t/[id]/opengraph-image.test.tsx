import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

const mocks = vi.hoisted(() => ({ getTrip: vi.fn() }));

vi.mock("@/lib/trip/service", () => ({ getTrip: mocks.getTrip }));

import Image from "./opengraph-image";

beforeEach(() => {
  vi.clearAllMocks();
});

// The PNG encoding step (resvg-wasm) isn't reliably drainable under vitest's
// node environment, so these only check the response shape and branching —
// the actual pixel render is verified in a real browser/server (see the
// grand-tour-testing skill: canvas/Satori rendering gets browser
// verification, not unit coverage).
describe("opengraph-image", () => {
  it("renders a PNG for a found trip", async () => {
    mocks.getTrip.mockResolvedValue(makeTrip(3, { title: "Coastal Run" }));

    const response = await Image({ params: Promise.resolve({ id: "abc12345" }) });

    expect(response.headers.get("content-type")).toBe("image/png");
    expect(mocks.getTrip).toHaveBeenCalledWith("abc12345");
  });

  it("renders a fallback PNG for a missing trip without throwing", async () => {
    mocks.getTrip.mockResolvedValue(null);

    const response = await Image({ params: Promise.resolve({ id: "missing1" }) });

    expect(response.headers.get("content-type")).toBe("image/png");
  });

  it("renders a single-stop trip without a degenerate route", async () => {
    mocks.getTrip.mockResolvedValue(makeTrip(2));

    const response = await Image({ params: Promise.resolve({ id: "abc12345" }) });

    expect(response.headers.get("content-type")).toBe("image/png");
  });
});
