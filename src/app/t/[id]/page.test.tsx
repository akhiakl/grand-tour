import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

const mocks = vi.hoisted(() => ({
  getTrip: vi.fn(),
  incrViews: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/trip/service", () => ({
  getTrip: mocks.getTrip,
  incrViews: mocks.incrViews,
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
}));

import SharedTripPage, { generateMetadata } from "./page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SharedTripPage", () => {
  it("renders TripExperience with the trip in remix mode and counts a view", async () => {
    const trip = makeTrip(2, { title: "Alpine Loop" });
    mocks.getTrip.mockResolvedValue(trip);
    mocks.incrViews.mockResolvedValue(1);

    const element = await SharedTripPage({
      params: Promise.resolve({ id: "abc12345" }),
    });

    expect(element.props.trip).toEqual(trip);
    expect(element.props.actions).toBe("remix");
    expect(mocks.incrViews).toHaveBeenCalledWith("abc12345");
  });

  it("calls notFound and skips the view count for a missing trip", async () => {
    mocks.getTrip.mockResolvedValue(null);

    await expect(
      SharedTripPage({ params: Promise.resolve({ id: "missing1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.incrViews).not.toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  it("builds the title and a stats-based description for a found trip", async () => {
    const trip = makeTrip(3, { title: "Coastal Run" });
    mocks.getTrip.mockResolvedValue(trip);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "abc12345" }),
    });

    expect(metadata.title).toBe("Coastal Run");
    expect(metadata.description).toContain("3 cities");
  });

  it("falls back to a plain title for a missing trip", async () => {
    mocks.getTrip.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "missing1" }),
    });

    expect(metadata.title).toBe("Map not found");
  });
});
