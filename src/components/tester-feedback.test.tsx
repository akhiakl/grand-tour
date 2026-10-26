import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ userback: vi.fn(), idle: true }));
vi.mock("@userback/widget", () => ({ default: mocks.userback }));
vi.mock("@/hooks/use-page-idle", () => ({ usePageIdle: () => mocks.idle }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  mocks.userback.mockClear();
  mocks.idle = true;
});

async function mount() {
  const { TesterFeedback } = await import("./tester-feedback");
  render(<TesterFeedback />);
}

describe("TesterFeedback", () => {
  it("loads nothing without a token", async () => {
    vi.stubEnv("NEXT_PUBLIC_USERBACK_TOKEN", "");
    await mount();
    await new Promise((r) => setTimeout(r, 20));
    expect(mocks.userback).not.toHaveBeenCalled();
  });

  it("starts the widget with the token once the page is idle", async () => {
    vi.stubEnv("NEXT_PUBLIC_USERBACK_TOKEN", "tok_123");
    await mount();
    await waitFor(() => expect(mocks.userback).toHaveBeenCalledWith("tok_123"));
  });

  it("waits for the page to go idle", async () => {
    vi.stubEnv("NEXT_PUBLIC_USERBACK_TOKEN", "tok_123");
    mocks.idle = false;
    await mount();
    await new Promise((r) => setTimeout(r, 20));
    expect(mocks.userback).not.toHaveBeenCalled();
  });
});
