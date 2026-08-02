import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TopBar } from "./top-bar";

const props = {
  title: "Grand Tour",
  eyebrow: "Field Atlas",
  activePanel: null,
  onTogglePanel: vi.fn(),
  onPoster: vi.fn(),
  onEditRoute: vi.fn(),
  onShare: vi.fn(),
};

beforeEach(() => {
  Object.values(props).forEach((fn) => typeof fn === "function" && fn.mockClear?.());
});

describe("TopBar variants", () => {
  it("demo (default): shows Edit this route + My Maps, no Share chip", () => {
    render(<TopBar {...props} />);
    expect(
      screen.getByRole("button", { name: /edit this route/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /my maps/i })).toHaveAttribute(
      "href",
      "/maps",
    );
    expect(
      screen.queryByRole("button", { name: /^share$/i }),
    ).not.toBeInTheDocument();
  });

  it("shared: shows Remix this trip + Create your own", () => {
    render(<TopBar {...props} variant="shared" />);
    expect(
      screen.getByRole("button", { name: /remix this trip/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create your own/i })).toHaveAttribute(
      "href",
      "/new",
    );
  });

  it("own: shows My Maps + Edit + Share", () => {
    render(<TopBar {...props} variant="own" sharing={false} />);
    expect(screen.getByRole("link", { name: /my maps/i })).toHaveAttribute(
      "href",
      "/maps",
    );
    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^share$/i })).toBeInTheDocument();
  });

  it("own: disables and relabels the Share chip while sharing", () => {
    render(<TopBar {...props} variant="own" sharing />);
    const shareButton = screen.getByRole("button", { name: /sharing…/i });
    expect(shareButton).toBeDisabled();
  });

  it("calls onEditRoute when the edit chip is clicked", async () => {
    render(<TopBar {...props} />);
    await userEvent.click(screen.getByRole("button", { name: /edit this route/i }));
    expect(props.onEditRoute).toHaveBeenCalledOnce();
  });

  it("calls onShare when the own-variant share chip is clicked", async () => {
    render(<TopBar {...props} variant="own" sharing={false} />);
    await userEvent.click(screen.getByRole("button", { name: /^share$/i }));
    expect(props.onShare).toHaveBeenCalledOnce();
  });
});
