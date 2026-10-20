import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UnitsDialog } from "./units-dialog";
import type { Units } from "./units-provider";

const units = vi.hoisted<Units>(() => ({
  prefs: { distance: "km", currency: "USD" },
  setPrefs: vi.fn(),
  money: () => "",
  distance: () => "",
  ratesStatus: "not-needed",
}));

vi.mock("./units-provider", () => ({ useUnits: () => units }));

beforeEach(() => {
  vi.mocked(units.setPrefs).mockClear();
  units.ratesStatus = "not-needed";
});

describe("UnitsDialog", () => {
  it("switches the distance unit", async () => {
    render(<UnitsDialog />);
    await userEvent.click(
      screen.getByRole("button", { name: "Units and currency" }),
    );

    expect(screen.getByRole("radio", { name: "Kilometres" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Miles" }));
    expect(units.setPrefs).toHaveBeenCalledWith({ distance: "mi", currency: "USD" });
  });

  it("shows the current currency and explains a rates outage", async () => {
    units.ratesStatus = "unavailable";
    render(<UnitsDialog />);
    await userEvent.click(
      screen.getByRole("button", { name: "Units and currency" }),
    );

    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveTextContent(
      "USD · US Dollar",
    );
    expect(screen.getByRole("status")).toHaveTextContent(/show in US dollars/);
  });
});
