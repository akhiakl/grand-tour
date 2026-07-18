import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeCity } from "@/test/fixtures/trip";

import { CityDrawer } from "./city-drawer";

const city = makeCity();
const onOpenChange = vi.fn();

const renderDrawer = () =>
  render(
    <CityDrawer city={city} index={0} count={5} open onOpenChange={onOpenChange} />,
  );

beforeEach(() => {
  onOpenChange.mockClear();
});

describe("CityDrawer", () => {
  it("shows the city header with stop position and budget", () => {
    renderDrawer();
    expect(screen.getByRole("heading", { name: city.name })).toBeInTheDocument();
    expect(screen.getByText(/Stop 1 of 5/)).toBeInTheDocument();
    expect(screen.getByText(/€90–160 per day/)).toBeInTheDocument();
  });

  it("opens on the overview tab with why and must-sees", () => {
    renderDrawer();
    expect(screen.getByText(city.why)).toBeInTheDocument();
    expect(screen.getByText(city.must[0])).toBeInTheDocument();
  });

  it("switches to the itinerary tab", async () => {
    renderDrawer();
    await userEvent.click(screen.getByRole("tab", { name: "Itinerary" }));
    expect(screen.getByText(city.days[0][1])).toBeInTheDocument();
    expect(screen.getByText(city.days[0][2])).toBeInTheDocument();
  });

  it("computes a total in the planner budget calculator", async () => {
    renderDrawer();
    await userEvent.click(screen.getByRole("tab", { name: "Planner" }));

    // Default slider midpoint: €(90 + (160-90)/2) = €125/day × 3 nights.
    expect(screen.getByText(/€375/)).toBeInTheDocument();
    expect(screen.getByText("Comfortable")).toBeInTheDocument();
  });

  it("tracks planner progress when items are checked", async () => {
    renderDrawer();
    await userEvent.click(screen.getByRole("tab", { name: "Planner" }));

    const total = city.must.length + city.gems.length;
    expect(screen.getByText(`0/${total} planned`)).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByText(`1/${total} planned`)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    renderDrawer();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
