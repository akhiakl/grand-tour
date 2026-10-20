import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { makeLeg } from "@/test/fixtures/trip";

import { MapLegend } from "./map-legend";

const legs = [makeLeg(), makeLeg(), makeLeg({ mode: "flight" })];

describe("MapLegend", () => {
  it("starts collapsed and expands to the marks this map uses", async () => {
    render(<MapLegend legs={legs} hasGhosts={false} />);
    const toggle = screen.getByRole("button", { name: "Legend" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Selected stop")).toBeInTheDocument();
    expect(screen.getAllByText("Train")).toHaveLength(1);
    expect(screen.getByText("Flight")).toBeInTheDocument();
    expect(screen.queryByText("Locked suggestion")).toBeNull();
  });

  it("explains locked suggestions when ghosts are on the map", async () => {
    render(<MapLegend legs={legs} hasGhosts />);
    await userEvent.click(screen.getByRole("button", { name: "Legend" }));
    expect(screen.getByText("Locked suggestion")).toBeInTheDocument();
  });
});
