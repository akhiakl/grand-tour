import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import RouteError from "./error";

const monitoring = vi.hoisted(() => ({ captureError: vi.fn() }));
vi.mock("@/lib/monitoring", () => monitoring);

describe("RouteError", () => {
  it("reports the error and offers a retry and a way home", async () => {
    const error = new Error("boom");
    const reset = vi.fn();
    render(<RouteError error={error} reset={reset} />);

    expect(monitoring.captureError).toHaveBeenCalledWith(error);
    expect(
      screen.getByRole("heading", { name: "We lost the trail for a moment." }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Back to the atlas" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
