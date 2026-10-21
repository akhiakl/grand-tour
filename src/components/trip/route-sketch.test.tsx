import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeCity, makeTrip } from "@/test/fixtures/trip";

import { RouteSketch } from "./route-sketch";

describe("RouteSketch", () => {
  it("names the route and labels every stop", () => {
    const trip = makeTrip(2, {
      cities: [
        makeCity({ name: "Lisbon", ll: [38.72, -9.14] }),
        makeCity({ name: "Porto", ll: [41.15, -8.61] }),
      ],
    });
    const { container } = render(<RouteSketch trip={trip} />);

    expect(
      screen.getByRole("img", { name: "Route sketch: Lisbon, Porto" }),
    ).toBeVisible();
    expect(screen.getByText("Lisbon")).toBeInTheDocument();
    expect(screen.getByText("Porto")).toBeInTheDocument();
    expect(container.querySelector("path")?.getAttribute("d")).toMatch(/^M/);
  });
});
