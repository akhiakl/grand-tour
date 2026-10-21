import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { makeLeg } from "@/test/fixtures/trip";

import { LegRow } from "./leg-row";

describe("LegRow", () => {
  it("offers the mode's estimate for the distance and applies it", async () => {
    const onChange = vi.fn();
    render(
      <LegRow
        leg={makeLeg({ duration: "" })}
        index={0}
        km={250}
        onChange={onChange}
      />,
    );
    expect(screen.getByText(/as the crow flies/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /use estimate/i }));
    expect(onChange).toHaveBeenCalledWith({ duration: "~3h 30m" });
  });

  it("hides the estimate until both stops are placed", () => {
    render(<LegRow leg={makeLeg()} index={0} km={null} onChange={vi.fn()} />);
    expect(screen.queryByText(/as the crow flies/)).not.toBeInTheDocument();
  });
});
