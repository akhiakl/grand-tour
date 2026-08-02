import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Trip } from "@/lib/trip";
import { makeTrip } from "@/test/fixtures/trip";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  saveLocalTrip: vi.fn<(trip: Trip, id?: string) => string>(() => "newid123"),
  share: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));

vi.mock("@/lib/trip", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  saveLocalTrip: mocks.saveLocalTrip,
}));

vi.mock("@/hooks/use-share-trip", () => ({
  useShareTrip: () => ({
    share: mocks.share,
    sharing: false,
    shareId: null,
    dialogOpen: false,
    setDialogOpen: vi.fn(),
  }),
}));

vi.mock("./trip-map", () => ({ TripMap: () => <div data-testid="trip-map" /> }));

import { TripExperience } from "./trip-experience";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.saveLocalTrip.mockReturnValue("newid123");
});

describe("TripExperience", () => {
  it("demo mode: edit forks a fresh copy with a new createdAt and no localId", async () => {
    const trip = makeTrip(2, { createdAt: 1000 });
    render(<TripExperience trip={trip} actions="demo" />);

    await userEvent.click(screen.getByRole("button", { name: /edit this route/i }));

    expect(mocks.saveLocalTrip).toHaveBeenCalledOnce();
    const [savedTrip, savedId] = mocks.saveLocalTrip.mock.calls[0];
    expect(savedId).toBeUndefined();
    expect(savedTrip.createdAt).not.toBe(1000);
    expect(mocks.push).toHaveBeenCalledWith("/new?remix=newid123");
  });

  it("own mode: edit updates the same local record in place", async () => {
    const trip = makeTrip(2, { createdAt: 1000 });
    render(<TripExperience trip={trip} actions="own" localId="existing1" />);

    await userEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    expect(mocks.saveLocalTrip).toHaveBeenCalledOnce();
    const [savedTrip, savedId] = mocks.saveLocalTrip.mock.calls[0];
    expect(savedId).toBe("existing1");
    expect(savedTrip.createdAt).toBe(1000);
    expect(mocks.push).toHaveBeenCalledWith("/new?remix=newid123");
  });

  it("own mode: the Share chip calls the share hook with the trip", async () => {
    const trip = makeTrip(2);
    render(<TripExperience trip={trip} actions="own" localId="existing1" />);

    await userEvent.click(screen.getByRole("button", { name: /^share$/i }));
    expect(mocks.share).toHaveBeenCalledWith(trip);
  });

  it("shared mode: remix also forks a fresh copy (no localId)", async () => {
    const trip = makeTrip(2, { createdAt: 1000 });
    render(<TripExperience trip={trip} actions="shared" />);

    await userEvent.click(screen.getByRole("button", { name: /remix this trip/i }));

    const [, savedId] = mocks.saveLocalTrip.mock.calls[0];
    expect(savedId).toBeUndefined();
  });
});
