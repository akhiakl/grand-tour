import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeLeg, makeTrip } from "@/test/fixtures/trip";

import { TimelineRail } from "./timeline-rail";

describe("TimelineRail", () => {
  const trip = makeTrip(3, {
    legs: [makeLeg(), makeLeg({ mode: "ferry", duration: "~1h 10m" })],
  });

  it("renders every stop with its night count", () => {
    render(<TimelineRail trip={trip} selectedIndex={null} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getAllByText(/3 nights/i)).toHaveLength(3);
  });

  it("renders a transport chip between consecutive stops", () => {
    render(<TimelineRail trip={trip} selectedIndex={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Train")).toBeInTheDocument();
    expect(screen.getByText("Ferry")).toBeInTheDocument();
    expect(screen.getByText("~1h 10m")).toBeInTheDocument();
  });

  it("selects a stop on click", async () => {
    const onSelect = vi.fn();
    render(<TimelineRail trip={trip} selectedIndex={null} onSelect={onSelect} />);

    await userEvent.click(screen.getAllByRole("button")[1]);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("marks the selected stop as the current step", () => {
    render(<TimelineRail trip={trip} selectedIndex={2} onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[2]).toHaveAttribute("aria-current", "step");
    expect(buttons[0]).not.toHaveAttribute("aria-current");
  });
});
