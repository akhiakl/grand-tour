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
});

describe("Itinerary", () => {
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
});
