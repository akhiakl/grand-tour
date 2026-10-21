import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { makeCity, makeTrip } from "@/test/fixtures/trip";

import { TripTools } from "./trip-tools";

const scope = { kind: "shared", id: "abc12345" } as const;
const trip = makeTrip(2, {
  cities: [makeCity({ country: "Italy" }), makeCity({ country: "Italy" })],
});

function renderTools(active: "packing" | "notes") {
  return render(
    <TripTools trip={trip} scope={scope} active={active} onBack={() => {}} />,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("TripTools", () => {
  it("lists packing items shaped by the trip", () => {
    renderTools("packing");
    expect(
      screen.getByRole("checkbox", {
        name: "Power adapter for type C/F/L sockets (Italy)",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/EU power adapter/)).not.toBeInTheDocument();
  });

  it("keeps ticks and own items after a reload", async () => {
    const first = renderTools("packing");
    await userEvent.click(screen.getByRole("checkbox", { name: "Power bank" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Add a packing item" }),
      "Snorkel{Enter}",
    );
    first.unmount();

    renderTools("packing");
    expect(screen.getByRole("checkbox", { name: "Power bank" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Snorkel" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Packed" })).not.toHaveAttribute(
      "aria-valuenow",
      "0",
    );

    await userEvent.click(screen.getByRole("button", { name: "Remove Snorkel" }));
    expect(
      screen.queryByRole("checkbox", { name: "Snorkel" }),
    ).not.toBeInTheDocument();
  });

  it("keeps notes after a reload", async () => {
    const first = renderTools("notes");
    await userEvent.type(
      screen.getByRole("textbox", { name: "Trip notes" }),
      "Gate B",
    );
    first.unmount();

    renderTools("notes");
    expect(screen.getByRole("textbox", { name: "Trip notes" })).toHaveValue(
      "Gate B",
    );
  });

  it("removes a suggested item and can restore it", async () => {
    const first = renderTools("packing");
    await userEvent.click(screen.getByRole("button", { name: "Remove Power bank" }));
    expect(
      screen.queryByRole("checkbox", { name: "Power bank" }),
    ).not.toBeInTheDocument();
    first.unmount();

    renderTools("packing");
    expect(
      screen.queryByRole("checkbox", { name: "Power bank" }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Restore 1 removed suggestion" }),
    );
    expect(screen.getByRole("checkbox", { name: "Power bank" })).toBeInTheDocument();
  });
});
