import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "./use-media-query";

function stubMatchMedia(initial: boolean) {
  const listeners = new Set<() => void>();
  const subscribed = vi.fn();
  const list = {
    matches: initial,
    addEventListener: (_: string, fn: () => void) => {
      subscribed();
      listeners.add(fn);
    },
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => list),
  );
  return {
    set(matches: boolean) {
      list.matches = matches;
      listeners.forEach((fn) => fn());
    },
    listeners,
    subscribed,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("useMediaQuery", () => {
  it("reads the current match and follows changes", () => {
    const media = stubMatchMedia(false);
    const { result, unmount } = renderHook(() =>
      useMediaQuery("(min-width: 1024px)"),
    );
    expect(result.current).toBe(false);

    act(() => media.set(true));
    expect(result.current).toBe(true);

    unmount();
    expect(media.listeners.size).toBe(0);
  });

  it("keeps one subscription across re-renders", () => {
    const media = stubMatchMedia(false);
    const { rerender } = renderHook(() => useMediaQuery("(min-width: 1024px)"));
    rerender();
    rerender();
    expect(media.subscribed).toHaveBeenCalledOnce();
  });
});
