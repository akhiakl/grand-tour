import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UpsellModal } from "./upsell-modal";

const onOpenChange = vi.fn();

beforeEach(() => {
  onOpenChange.mockClear();
});

describe("UpsellModal", () => {
  it("lists the locked Phase 2 features", () => {
    render(<UpsellModal open onOpenChange={onOpenChange} />);
    expect(screen.getByText("15 stops")).toBeInTheDocument();
    expect(screen.getByText("Permanent links")).toBeInTheDocument();
    expect(screen.getByText("PDF export")).toBeInTheDocument();
    expect(screen.getByText("Custom themes")).toBeInTheDocument();
  });

  it("mentions the guest stop ceiling", () => {
    render(<UpsellModal open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("heading", { name: "5 stops, for now" })).toBeVisible();
  });

  it("closes via the primary button", async () => {
    render(<UpsellModal open onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape", async () => {
    render(<UpsellModal open onOpenChange={onOpenChange} />);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders nothing when closed", () => {
    render(<UpsellModal open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByText("15 stops")).not.toBeInTheDocument();
  });
});
