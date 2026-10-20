import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import { PosterDialog } from "./poster-dialog";

vi.mock("./draw-poster", () => ({
  drawPoster: vi.fn().mockRejectedValue(new Error("no 2d context")),
}));

describe("PosterDialog", () => {
  it("shows an in-voice error instead of loading forever when drawing fails", async () => {
    render(<PosterDialog trip={makeTrip()} open onOpenChange={() => undefined} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("The press jammed");
    expect(screen.getByRole("button", { name: /download png/i })).toBeDisabled();
  });
});
