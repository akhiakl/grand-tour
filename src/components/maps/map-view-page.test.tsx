import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useMounted: vi.fn(),
  getLocalTrip: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useParams: mocks.useParams }));
vi.mock("@/hooks/use-mounted", () => ({ useMounted: mocks.useMounted }));
vi.mock("@/lib/trip", () => ({ getLocalTrip: mocks.getLocalTrip }));
vi.mock("@/components/trip/trip-experience", () => ({
  TripExperience: ({ trip, actions, localId }: never) => (
    <div data-testid="trip-experience">
      {JSON.stringify({
        title: (trip as { title: string }).title,
        actions,
        localId,
      })}
    </div>
  ),
}));

import { MapViewPage } from "./map-view-page";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useParams.mockReturnValue({ id: "abc12345" });
});

describe("MapViewPage", () => {
  it("renders nothing before the client has mounted", () => {
    mocks.useMounted.mockReturnValue(false);
    const { container } = render(<MapViewPage />);
    expect(container).toBeEmptyDOMElement();
    expect(mocks.getLocalTrip).not.toHaveBeenCalled();
  });

  it("renders TripExperience in own mode for a found local trip", () => {
    mocks.useMounted.mockReturnValue(true);
    const trip = makeTrip(2, { title: "Alpine Loop" });
    mocks.getLocalTrip.mockReturnValue({ id: "abc12345", trip, updatedAt: 1 });

    render(<MapViewPage />);

    expect(mocks.getLocalTrip).toHaveBeenCalledWith("abc12345");
    expect(screen.getByTestId("trip-experience")).toHaveTextContent(
      JSON.stringify({ title: "Alpine Loop", actions: "own", localId: "abc12345" }),
    );
  });

  it("shows the not-on-this-device state for a missing local trip", () => {
    mocks.useMounted.mockReturnValue(true);
    mocks.getLocalTrip.mockReturnValue(null);

    render(<MapViewPage />);

    expect(screen.getByText("Not on this device")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to my maps/i })).toHaveAttribute(
      "href",
      "/maps",
    );
  });
});
