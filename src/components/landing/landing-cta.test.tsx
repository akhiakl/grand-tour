import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingCta } from "./landing-cta";

describe("LandingCta", () => {
  it("links every journey from the landing", () => {
    render(<LandingCta />);

    expect(screen.getByRole("link", { name: /plan with ai/i })).toHaveAttribute(
      "href",
      "/plan",
    );
    expect(screen.getByRole("link", { name: /build manually/i })).toHaveAttribute(
      "href",
      "/new",
    );
    expect(screen.getByRole("link", { name: /my maps/i })).toHaveAttribute(
      "href",
      "/maps",
    );
  });

  it("is labelled as a landmark for screen readers", () => {
    render(<LandingCta />);

    expect(
      screen.getByRole("complementary", { name: /start your own route/i }),
    ).toBeInTheDocument();
  });
});
