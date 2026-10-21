import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeLeg, makeRouteCities, makeTrip } from "@/test/fixtures/trip";

import { Itinerary, StatsGrid } from "./route-overview";

const trip = makeTrip(3, {
  cities: makeRouteCities(3),
  legs: [makeLeg(), makeLeg({ mode: "ferry", duration: "~4h" })],
});

describe("StatsGrid", () => {
  it("summarises nights, cities, distance and budget", () => {
    render(<StatsGrid trip={trip} />);
    expect(screen.getByText("Nights")).toBeInTheDocument();
    expect(screen.getByText("Cities")).toBeInTheDocument();
    expect(screen.getByText("in 1 country")).toBeInTheDocument();
    expect(screen.getByText(/km$/)).toBeInTheDocument();
    expect(screen.getByText("Budget / person")).toBeInTheDocument();
  });

  it("shows the date span beside the nights for a dated trip", () => {
    render(<StatsGrid trip={{ ...trip, startDate: "2027-05-01" }} />);
    // Three 3-night stops: May 1 to May 10.
    expect(screen.getByText(/^May 1\s?–\s?10$/)).toBeInTheDocument();
  });
});

describe("Itinerary", () => {
  it("dates each stop when the trip has a start date", () => {
    render(
      <Itinerary
        trip={{ ...trip, startDate: "2027-05-01" }}
        selectedIndex={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(/^May 4\s?–\s?7 · 3 nights/)).toBeInTheDocument();
  });

  it("lists stops with the legs between them", () => {
    render(<Itinerary trip={trip} selectedIndex={1} onSelect={vi.fn()} />);
    const list = screen.getByRole("list", { name: "Itinerary" });

    expect(within(list).getAllByRole("button")).toHaveLength(3);
    expect(
      within(list).getByRole("listitem", { name: "Ferry, ~4h" }),
    ).toBeInTheDocument();
    expect(within(list).getByRole("button", { name: /Stop 2/ })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("selects a stop", async () => {
    const onSelect = vi.fn();
    render(<Itinerary trip={trip} selectedIndex={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: /Stop 3/ }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("reports hover and focus on a row, and lights up the hovered row", async () => {
    const onHover = vi.fn();
    render(
      <Itinerary
        trip={trip}
        selectedIndex={null}
        onSelect={vi.fn()}
        hoveredIndex={0}
        onHover={onHover}
      />,
    );
    const second = screen.getByRole("button", { name: /Stop 2/ });

    expect(screen.getByRole("button", { name: /Vienna/ })).toHaveAttribute(
      "data-hovered",
    );
    await userEvent.hover(second);
    expect(onHover).toHaveBeenLastCalledWith(1);
    await userEvent.unhover(second);
    expect(onHover).toHaveBeenLastCalledWith(null);
    await userEvent.tab();
    expect(onHover).toHaveBeenLastCalledWith(0);
  });

  it("titles each stop name so a truncated one can still be read", () => {
    render(<Itinerary trip={trip} selectedIndex={null} onSelect={vi.fn()} />);
    expect(screen.getByTitle("Vienna")).toBeInTheDocument();
  });
});
