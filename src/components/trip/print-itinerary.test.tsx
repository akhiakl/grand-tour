import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeCity, makeLeg, makeTrip } from "@/test/fixtures/trip";

import { PrintItinerary } from "./print-itinerary";

describe("PrintItinerary", () => {
  it("lays out every stop, its plan and the legs between, with dates", () => {
    const trip = makeTrip(2, {
      title: "Alps",
      startDate: "2027-05-01",
      cities: [makeCity({ name: "Vienna" }), makeCity({ name: "Salzburg" })],
      legs: [makeLeg({ label: "Railjet", duration: "~2h 30m" })],
    });
    render(<PrintItinerary trip={trip} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Alps" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /Vienna/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /Salzburg/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Train · Railjet · ~2h 30m/)).toBeInTheDocument();
    expect(screen.getAllByText("Schönbrunn")).toHaveLength(2);
    expect(screen.getByText(/^May 1\s?–\s?4 · 3 nights/)).toBeInTheDocument();
  });
});
