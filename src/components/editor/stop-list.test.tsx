import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeCity, makeLeg } from "@/test/fixtures/trip";

import { StopList } from "./stop-list";

vi.mock("./city-search", () => ({
  CitySearch: () => <div data-testid="city-search" />,
}));

const props = {
  onAddCity: vi.fn(),
  onRemoveCity: vi.fn(),
  onMoveCity: vi.fn(),
  onUpdateCity: vi.fn(),
  onUpdateLeg: vi.fn(),
  onLimitReached: vi.fn(),
};

beforeEach(() => {
  Object.values(props).forEach((fn) => fn.mockClear());
});

describe("StopList", () => {
  it("renders one row per city and a leg row between consecutive stops", () => {
    const cities = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];
    const legs = [makeLeg()];
    render(<StopList {...props} cities={cities} legs={legs} canAddCity />);

    expect(screen.getByDisplayValue("Vienna")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Prague")).toBeInTheDocument();
    expect(screen.getByText("2/5 stops")).toBeInTheDocument();
  });

  it("shows the search widget and adds a blank stop", async () => {
    render(<StopList {...props} cities={[]} legs={[]} canAddCity />);

    expect(screen.getByTestId("city-search")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Or add a blank stop" }),
    );
    expect(props.onAddCity).toHaveBeenCalledWith(
      expect.objectContaining({ name: "New stop" }),
    );
  });

  it("removes a stop via its delete button", async () => {
    const cities = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];
    render(<StopList {...props} cities={cities} legs={[makeLeg()]} canAddCity />);

    await userEvent.click(screen.getByRole("button", { name: "Remove Vienna" }));
    expect(props.onRemoveCity).toHaveBeenCalledWith(0);
  });

  it("moves a stop up and down", async () => {
    const cities = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];
    render(<StopList {...props} cities={cities} legs={[makeLeg()]} canAddCity />);

    await userEvent.click(screen.getByRole("button", { name: "Move Prague up" }));
    expect(props.onMoveCity).toHaveBeenCalledWith(1, 0);

    await userEvent.click(screen.getByRole("button", { name: "Move Vienna down" }));
    expect(props.onMoveCity).toHaveBeenCalledWith(0, 1);
  });

  it("disables move buttons at the ends of the list", () => {
    const cities = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];
    render(<StopList {...props} cities={cities} legs={[makeLeg()]} canAddCity />);

    expect(screen.getByRole("button", { name: "Move Vienna up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move Prague down" })).toBeDisabled();
  });

  it("shows the guest-limit prompt instead of search once at the ceiling", async () => {
    render(<StopList {...props} cities={[]} legs={[]} canAddCity={false} />);

    expect(screen.queryByTestId("city-search")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "See what unlocks" }));
    expect(props.onLimitReached).toHaveBeenCalledOnce();
  });

  it("expands a stop row to reveal its detail fields", async () => {
    const cities = [makeCity({ name: "Vienna", why: "Coffee houses" })];
    render(<StopList {...props} cities={cities} legs={[]} canAddCity />);

    expect(screen.queryByDisplayValue("Coffee houses")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Edit all details" }));
    expect(screen.getByDisplayValue("Coffee houses")).toBeInTheDocument();
  });

  it("keeps the open detail panel on its stop after a reorder", async () => {
    const vienna = makeCity({ name: "Vienna", why: "Coffee houses" });
    const prague = makeCity({ name: "Prague", why: "Castle district" });
    const { rerender } = render(
      <StopList
        {...props}
        cities={[vienna, prague]}
        legs={[makeLeg()]}
        canAddCity
      />,
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "Edit all details" })[0],
    );
    await userEvent.click(screen.getByRole("button", { name: "Move Vienna down" }));
    rerender(
      <StopList
        {...props}
        cities={[prague, vienna]}
        legs={[makeLeg()]}
        canAddCity
      />,
    );

    expect(screen.getByDisplayValue("Coffee houses")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Castle district")).not.toBeInTheDocument();
  });

  it("closes the detail panel when its stop is removed", async () => {
    const vienna = makeCity({ name: "Vienna", why: "Coffee houses" });
    const prague = makeCity({ name: "Prague", why: "Castle district" });
    const { rerender } = render(
      <StopList
        {...props}
        cities={[vienna, prague]}
        legs={[makeLeg()]}
        canAddCity
      />,
    );

    await userEvent.click(
      screen.getAllByRole("button", { name: "Edit all details" })[0],
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove Vienna" }));
    rerender(<StopList {...props} cities={[prague]} legs={[]} canAddCity />);

    expect(screen.queryByDisplayValue("Castle district")).not.toBeInTheDocument();
  });

  it("shows inline errors linked to the offending fields", () => {
    const cities = [makeCity({ name: "" }), makeCity({ name: "Prague" })];
    render(
      <StopList
        {...props}
        cities={cities}
        legs={[makeLeg()]}
        canAddCity
        issues={{
          "cities.0.name": "nameRequired",
          "cities.1.nights": "nightsRange",
        }}
      />,
    );

    const name = screen.getAllByLabelText("City")[0];
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Give this stop a name.");
    expect(screen.getAllByLabelText("Nights")[1]).toHaveAccessibleDescription(
      "Nights run from 0 to 30.",
    );
    expect(screen.getAllByLabelText("City")[1]).not.toHaveAttribute("aria-invalid");
  });

  it("clamps typed nights into range", async () => {
    render(
      <StopList
        {...props}
        cities={[makeCity({ nights: 3 })]}
        legs={[]}
        canAddCity
      />,
    );

    const nights = screen.getByLabelText("Nights");
    await userEvent.clear(nights);
    expect(props.onUpdateCity).toHaveBeenLastCalledWith(0, { nights: 0 });
    await userEvent.type(nights, "45");
    expect(props.onUpdateCity).toHaveBeenLastCalledWith(0, { nights: 30 });
  });
});
