import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import AboutPage from "./page";

describe("AboutPage", () => {
  it("leads with the pitch and both ways to start", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Every journey deserves a map worth sharing",
    );
    expect(
      screen.getAllByRole("link", { name: /plan with ai/i })[0],
    ).toHaveAttribute("href", "/plan");
    expect(
      screen.getAllByRole("link", { name: /build manually/i })[0],
    ).toHaveAttribute("href", "/new");
  });

  it("walks through the three steps in order", () => {
    render(<AboutPage />);
    const steps = within(
      screen.getByRole("region", { name: /from a hunch/i }),
    ).getAllByRole("listitem");
    expect(steps.map((step) => step.querySelector("h3")?.textContent)).toEqual([
      "Describe",
      "Shape",
      "Share",
    ]);
  });

  it("links the example route to the live map", () => {
    render(<AboutPage />);
    const example = screen.getByRole("link", { name: /open the live map/i });
    expect(example).toHaveAttribute("href", "/");
    expect(
      within(example).getByRole("img", { name: /route sketch/i }),
    ).toBeVisible();
  });

  it("answers questions in native disclosures", async () => {
    const user = userEvent.setup();
    render(<AboutPage />);
    const question = screen.getByText("Do I need an account?");
    const details = question.closest("details");
    expect(details).not.toHaveAttribute("open");
    await user.click(question);
    expect(details).toHaveAttribute("open");
  });

  it("ends with the site footer", () => {
    render(<AboutPage />);
    const legal = screen.getByRole("navigation", { name: "Legal" });
    expect(within(legal).getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(within(legal).getByRole("link", { name: "Privacy" })).toBeVisible();
  });
});
