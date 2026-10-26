import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

const mocks = vi.hoisted(() => ({
  getTrip: vi.fn(),
  incrViews: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  emit: vi.fn(),
}));

vi.mock("@/lib/logging", () => ({ emit: mocks.emit }));

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
  it("renders TripExperience with the trip in shared mode and counts a view", async () => {
    const trip = makeTrip(2, { title: "Alpine Loop" });
    mocks.getTrip.mockResolvedValue(trip);
    mocks.incrViews.mockResolvedValue(7);

    const element = await SharedTripPage({
      params: Promise.resolve({ id: "abc12345" }),
    });

    expect(element.props.trip).toEqual(trip);
    expect(element.props.actions).toBe("shared");
    expect(element.props.shareId).toBe("abc12345");
    expect(element.props.views).toBe(7);
    expect(mocks.incrViews).toHaveBeenCalledWith("abc12345");
  });

  it("logs a view without the trip id", async () => {
    mocks.getTrip.mockResolvedValue(makeTrip());
    mocks.incrViews.mockResolvedValue(1);

    await SharedTripPage({ params: Promise.resolve({ id: "abc12345" }) });

    expect(mocks.emit).toHaveBeenCalledWith("info", "trip viewed", {
      route: "/t/[id]",
    });
  });

  it("logs a missing trip without the id that was asked for", async () => {
    mocks.getTrip.mockResolvedValue(null);

    await expect(
      SharedTripPage({ params: Promise.resolve({ id: "missing1" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.emit).toHaveBeenCalledWith("warn", "trip not found", {
      route: "/t/[id]",
      status: 404,
    });
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
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("falls back to a plain title for a missing trip", async () => {
    mocks.getTrip.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "missing1" }),
    });

    expect(metadata.title).toBe("Map not found");
    expect(metadata.robots).toEqual({ index: false });
  });
});
