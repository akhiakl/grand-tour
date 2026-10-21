import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnitsButton } from "./units-button";

const idle = vi.hoisted(() => ({ value: false }));
vi.mock("@/hooks/use-page-idle", () => ({ usePageIdle: () => idle.value }));
vi.mock("./units-dialog", () => ({
  UnitsDialog: () => <button type="button">Units and currency</button>,
}));

describe("UnitsButton", () => {
  it("shows a disabled look-alike until the page is idle", () => {
    idle.value = false;
    render(<UnitsButton />);
    expect(
      screen.getByRole("button", { name: "Units and currency" }),
    ).toBeDisabled();
  });

  it("swaps in the real dialog once idle", async () => {
    idle.value = true;
    render(<UnitsButton />);
    // The loading fallback is the same placeholder until the chunk lands.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Units and currency" }),
      ).toBeEnabled(),
    );
  });
});
