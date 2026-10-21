import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveLocalTrip } from "@/lib/trip";
import { makeTrip } from "@/test/fixtures/trip";

import { LandingCta } from "./landing-cta";

// The real search calls Photon; here "picking" a city is one click.
vi.mock("@/components/editor/city-search", async () => {
  const { makeCitySearchResult } = await import("@/test/fixtures/geo-search");
  return {
    CitySearch: ({
      onSelect,
      label,
    }: {
      readonly onSelect: (result: unknown) => void;
      readonly label: string;
    }) => (
      <button type="button" onClick={() => onSelect(makeCitySearchResult())}>
        {label}
      </button>
    ),
  };
});

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

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
    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });

  it("points first-time visitors to how it works", () => {
    render(<LandingCta />);
    expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("turns a picked destination into AI and manual starts", async () => {
    const user = userEvent.setup();
    render(<LandingCta />);

    await user.click(screen.getByRole("button", { name: "Where to?" }));

    const group = screen.getByRole("group", {
      name: "Start a route to Kyoto, Japan",
    });
    expect(group).toBeVisible();
    expect(screen.getByRole("link", { name: /plan with ai/i })).toHaveAttribute(
      "href",
      "/plan?destination=Kyoto%2C+Japan",
    );
    const manual = screen.getByRole("link", { name: /build manually/i });
    expect(manual.getAttribute("href")).toMatch(/^\/new\?city=Kyoto&country=Japan/);

    await user.click(screen.getByRole("button", { name: "Clear destination" }));
    expect(
      screen.getByRole("group", { name: /start your own route/i }),
    ).toBeVisible();
  });

  it("leads returning visitors with their latest map", () => {
    vi.spyOn(Date, "now").mockReturnValueOnce(1_000).mockReturnValueOnce(2_000);
    saveLocalTrip(makeTrip(2, { title: "Older trip" }));
    const latest = saveLocalTrip(makeTrip(3, { title: "Alpine loop" }));
    render(<LandingCta />);

    expect(screen.getByText("Welcome back")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /continue alpine loop/i }),
    ).toHaveAttribute("href", `/maps/${latest}`);
    // Continue takes the brass slot; starting fresh steps down a tier.
    expect(screen.getByRole("link", { name: /plan with ai/i })).not.toHaveClass(
      "bg-brass",
    );
  });
});
