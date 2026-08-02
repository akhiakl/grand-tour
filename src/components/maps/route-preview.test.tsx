import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeCity } from "@/test/fixtures/trip";

import { RoutePreview } from "./route-preview";

describe("RoutePreview", () => {
  it("draws one circle per city and a connecting path", () => {
    const cities = [
      makeCity({ name: "Vienna", ll: [48.2, 16.37] }),
      makeCity({ name: "Prague", ll: [50.08, 14.44] }),
      makeCity({ name: "Berlin", ll: [52.52, 13.4] }),
    ];
    const { container } = render(<RoutePreview cities={cities} />);

    expect(container.querySelectorAll("circle")).toHaveLength(3);
    expect(container.querySelector("path")).toBeInTheDocument();
  });

  it("renders a single dot without a path crash for one city", () => {
    const { container } = render(
      <RoutePreview cities={[makeCity({ name: "Vienna" })]} />,
    );
    expect(container.querySelectorAll("circle")).toHaveLength(1);
  });
});
