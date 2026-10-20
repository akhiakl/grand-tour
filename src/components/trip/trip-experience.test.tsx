import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Trip } from "@/lib/trip";
import { makeRouteCities, makeTrip } from "@/test/fixtures/trip";

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

vi.mock("./trip-map", () => ({
  TripMap: ({
    onCitySelect,
    onBackgroundClick,
    hoveredIndex,
    onCityHover,
  }: {
    readonly onCitySelect: (index: number) => void;
    readonly onBackgroundClick: () => void;
    readonly hoveredIndex: number | null;
    readonly onCityHover: (index: number | null) => void;
  }) => (
    <>
      <button type="button" onClick={() => onCitySelect(1)}>
        map marker
      </button>
      <button
        type="button"
        data-hovered={hoveredIndex ?? "none"}
        onMouseEnter={() => onCityHover(2)}
        onMouseLeave={() => onCityHover(null)}
      >
        hoverable marker
      </button>
      <button type="button" onClick={onBackgroundClick}>
        map background
      </button>
    </>
  ),
}));

import { TripExperience } from "./trip-experience";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.saveLocalTrip.mockReturnValue("newid123");
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

const routeTrip = (overrides: Partial<Trip> = {}) =>
  makeTrip(3, { cities: makeRouteCities(3), ...overrides });

describe("TripExperience", () => {
  it("demo mode: labels the example and forks a fresh copy on Customize", async () => {
    render(<TripExperience trip={routeTrip({ createdAt: 1000 })} actions="demo" />);

    expect(screen.getByText("Example route")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /customize/i }));

    const [savedTrip, savedId] = mocks.saveLocalTrip.mock.calls[0];
    expect(savedId).toBeUndefined();
    expect(savedTrip.createdAt).not.toBe(1000);
    expect(mocks.push).toHaveBeenCalledWith("/new?remix=newid123");
  });

  it("demo mode: a landing CTA replaces the primary actions", () => {
    render(
      <TripExperience trip={routeTrip()} cta={<a href="/plan">Plan with AI</a>} />,
    );
    expect(screen.getByRole("link", { name: "Plan with AI" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit this route/i })).toBeNull();
  });

  it("own mode: edit updates the same local record in place", async () => {
    render(
      <TripExperience
        trip={routeTrip({ createdAt: 1000 })}
        actions="own"
        localId="existing1"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^edit$/i }));

    const [savedTrip, savedId] = mocks.saveLocalTrip.mock.calls[0];
    expect(savedId).toBe("existing1");
    expect(savedTrip.createdAt).toBe(1000);
  });

  it("own mode: Share calls the share hook with the trip", async () => {
    const trip = routeTrip();
    render(<TripExperience trip={trip} actions="own" localId="existing1" />);

    await userEvent.click(screen.getByRole("button", { name: /^share$/i }));
    expect(mocks.share).toHaveBeenCalledWith(trip, "existing1");
  });

  it("shared mode: tells viewers how often the link was opened and how long it lasts", () => {
    render(
      <TripExperience
        trip={routeTrip()}
        actions="shared"
        shareId="abc12345"
        views={12}
      />,
    );
    expect(screen.getByText(/Opened 12 times\./)).toBeInTheDocument();
    expect(screen.getByText(/stays live for 60 days/)).toBeInTheDocument();
  });

  it("shared mode: remix also forks a fresh copy (no localId)", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);

    await userEvent.click(screen.getByRole("button", { name: /remix this trip/i }));
    expect(mocks.saveLocalTrip.mock.calls[0][1]).toBeUndefined();
  });

  it("opens a stop's detail from the itinerary and steps back with Escape", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);

    const itinerary = screen.getByRole("list", { name: "Itinerary" });
    await userEvent.click(within(itinerary).getByRole("button", { name: /Stop 2/ }));
    expect(
      screen.getByRole("heading", { level: 2, name: "Stop 2" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Itinerary" })).toBeNull();

    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("list", { name: "Itinerary" })).toBeInTheDocument();
  });

  it("a stop picked on the map opens its detail too", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);

    await userEvent.click(screen.getByRole("button", { name: "map marker" }));
    expect(
      screen.getByRole("heading", { level: 2, name: "Stop 2" }),
    ).toBeInTheDocument();
  });

  it("packing keeps its ticks across a detour to a stop", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);

    await userEvent.click(screen.getByRole("button", { name: "Packing" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Power bank" }));
    await userEvent.click(screen.getByRole("button", { name: "map marker" }));
    await userEvent.click(screen.getByRole("button", { name: "Route" }));

    await userEvent.click(screen.getByRole("button", { name: "Packing" }));
    expect(screen.getByRole("checkbox", { name: "Power bank" })).toBeChecked();
  });

  it("picking a stop opens the sheet; tapping the map lowers it", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);
    const handle = () => screen.getByRole("button", { name: /trip details/i });
    expect(handle()).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(screen.getByRole("button", { name: "map marker" }));
    expect(handle()).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByRole("button", { name: "map background" }));
    expect(handle()).toHaveAttribute("aria-expanded", "false");
  });

  it("syncs hover between itinerary rows and map markers", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);
    const marker = screen.getByRole("button", { name: "hoverable marker" });
    const row = (name: RegExp) =>
      within(screen.getByRole("list", { name: "Itinerary" })).getByRole("button", {
        name,
      });

    await userEvent.hover(row(/Stop 2/));
    expect(marker).toHaveAttribute("data-hovered", "1");
    await userEvent.unhover(row(/Stop 2/));
    expect(marker).toHaveAttribute("data-hovered", "none");

    await userEvent.hover(marker);
    expect(row(/Stop 3/)).toHaveAttribute("data-hovered");
    await userEvent.unhover(marker);
    expect(row(/Stop 3/)).not.toHaveAttribute("data-hovered");
  });

  it("collapses the desktop card to its head and expands it again", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);
    const itinerary = screen.getByRole("list", { name: "Itinerary" });

    await userEvent.click(
      screen.getByRole("button", { name: "Collapse trip card" }),
    );
    const toggle = screen.getByRole("button", { name: "Expand trip card" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(itinerary.closest("[inert]")).not.toBeNull();

    await userEvent.click(toggle);
    expect(
      screen.getByRole("button", { name: "Collapse trip card" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(itinerary.closest("[inert]")).toBeNull();
  });

  it("a stop picked on the map unfolds a collapsed card", async () => {
    render(<TripExperience trip={routeTrip()} actions="shared" />);

    await userEvent.click(
      screen.getByRole("button", { name: "Collapse trip card" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "map marker" }));
    expect(
      screen.getByRole("button", { name: "Collapse trip card" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
