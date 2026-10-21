import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return import("./use-page-idle");
}

describe("usePageIdle", () => {
  afterEach(() => vi.useRealTimers());

  it("turns true once the loaded page is idle, and stays true", async () => {
    vi.useFakeTimers();
    const { usePageIdle } = await load();
    const { result } = renderHook(() => usePageIdle());
    expect(result.current).toBe(false);

    await act(() => vi.runAllTimersAsync());
    expect(result.current).toBe(true);

    // Later mounts (client navigations) get the map straight away.
    const later = renderHook(() => usePageIdle());
    expect(later.result.current).toBe(true);
  });

  it("waits for the load event when the page is still loading", async () => {
    vi.useFakeTimers();
    const readyState = vi
      .spyOn(document, "readyState", "get")
      .mockReturnValue("loading");
    const { usePageIdle } = await load();
    const { result } = renderHook(() => usePageIdle());

    await act(() => vi.runAllTimersAsync());
    expect(result.current).toBe(false);

    readyState.mockReturnValue("complete");
    window.dispatchEvent(new Event("load"));
    await act(() => vi.runAllTimersAsync());
    expect(result.current).toBe(true);
    readyState.mockRestore();
  });
});
