import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ShareDialog } from "./share-dialog";

const toastMocks = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast: toastMocks }));

const onOpenChange = vi.fn();

beforeEach(() => {
  onOpenChange.mockClear();
  toastMocks.error.mockClear();
  toastMocks.success.mockClear();
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ShareDialog", () => {
  it("shows the full share URL for the given id", () => {
    render(<ShareDialog shareId="abc12345" open onOpenChange={onOpenChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toContain("/t/abc12345");
  });

  it("copies the link and confirms via toast", async () => {
    render(<ShareDialog shareId="abc12345" open onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: /copy/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/t/abc12345"),
    );
    expect(toastMocks.success).toHaveBeenCalledWith("Map shared — link copied");
    expect(
      await screen.findByRole("button", { name: /copied/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(
      <ShareDialog shareId="abc12345" open={false} onOpenChange={onOpenChange} />,
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
