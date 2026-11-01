import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeCity, makeLeg } from "@/test/fixtures/trip";

import { StopList } from "./stop-list";

vi.mock("./city-search", () => ({
  CitySearch: () => (
    <div data-testid="city-search">
      <input aria-label="Search for a city" />
    </div>
  ),
}));

const props = {
  keys: ["a", "b", "c", "d", "e"],
  onAddCity: vi.fn(),
  onRemoveCity: vi.fn(),
  onMoveCity: vi.fn(),
  onUpdateCity: vi.fn(),
  onUpdateLeg: vi.fn(),
  onLimitReached: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
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

  it("announces where a moved stop went", async () => {
    const cities = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];
    render(<StopList {...props} cities={cities} legs={[makeLeg()]} canAddCity />);

    await userEvent.click(screen.getByRole("button", { name: "Move Prague up" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Prague moved to stop 1 of 2.",
    );
  });

  it("keeps focus on the moved stop's move buttons", async () => {
    const cities = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];
    const { rerender } = render(
      <StopList {...props} cities={cities} legs={[makeLeg()]} canAddCity />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Move Prague up" }));
    // The parent applies the move; Prague is now first, so its up button is
    // disabled and focus lands on its down button.
    rerender(
      <StopList
        {...props}
        cities={[cities[1], cities[0]]}
        legs={[makeLeg()]}
        canAddCity
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Move Prague down" })).toHaveFocus(),
    );
  });

  it("marks the stop being edited as active", async () => {
    const onActivate = vi.fn();
    const cities = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];
    render(
      <StopList
        {...props}
        cities={cities}
        legs={[makeLeg()]}
        canAddCity
        onActivate={onActivate}
      />,
    );

    await userEvent.click(
      screen.getByLabelText("City", { selector: "#stop-1-name" }),
    );
    expect(onActivate).toHaveBeenCalledWith(1);
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

  describe("keyboard focus", () => {
    const two = [makeCity({ name: "Vienna" }), makeCity({ name: "Prague" })];

    it("lands on the stop that slid into a removed stop's place", async () => {
      render(<StopList {...props} cities={two} legs={[makeLeg()]} canAddCity />);
      await userEvent.click(screen.getByRole("button", { name: "Remove Vienna" }));
      await waitFor(() =>
        expect(document.getElementById("stop-0-name")).toHaveFocus(),
      );
    });

    it("lands on the search when the last stop is removed", async () => {
      const { rerender } = render(
        <StopList {...props} cities={[two[0]]} legs={[]} canAddCity />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Remove Vienna" }));
      rerender(<StopList {...props} cities={[]} legs={[]} canAddCity />);
      await waitFor(() =>
        expect(
          screen.getByRole("textbox", { name: "Search for a city" }),
        ).toHaveFocus(),
      );
    });

    it("moves to the new stop's name after adding a blank stop", async () => {
      const { rerender } = render(
        <StopList {...props} cities={[two[0]]} legs={[]} canAddCity />,
      );
      props.onAddCity.mockImplementation(() =>
        rerender(<StopList {...props} cities={two} legs={[makeLeg()]} canAddCity />),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Or add a blank stop" }),
      );
      await waitFor(() =>
        expect(document.getElementById("stop-1-name")).toHaveFocus(),
      );
    });
  });
});
