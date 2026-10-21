import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OffTheMap } from "./off-the-map";

describe("OffTheMap", () => {
  it("leads on with a link", () => {
    render(
      <OffTheMap title="Gone" action={{ href: "/new", label: "Create your own" }}>
        Body copy
      </OffTheMap>,
    );
    expect(screen.getByRole("heading", { name: "Gone" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create your own" })).toHaveAttribute(
      "href",
      "/new",
    );
  });

  it("can retry in place and offer a way back", async () => {
    const onClick = vi.fn();
    render(
      <OffTheMap
        title="Broke"
        action={{ onClick, label: "Try again" }}
        secondary={{ href: "/", label: "Back to the atlas" }}
      >
        Body copy
      </OffTheMap>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Back to the atlas" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
