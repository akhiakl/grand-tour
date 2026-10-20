import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingCta } from "./landing-cta";

describe("LandingCta", () => {
  it("offers both ways to start a route, grouped for screen readers", () => {
    render(<LandingCta />);

    const group = screen.getByRole("group", { name: /start your own route/i });
    expect(group).toContainElement(
      screen.getByRole("link", { name: /plan with ai/i }),
    );
    expect(screen.getByRole("link", { name: /plan with ai/i })).toHaveAttribute(
      "href",
      "/plan",
    );
    expect(screen.getByRole("link", { name: /build manually/i })).toHaveAttribute(
      "href",
      "/new",
    );
  });
});
