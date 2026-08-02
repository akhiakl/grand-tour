import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import { useShareTrip } from "./use-share-trip";

const toastMocks = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast: toastMocks }));

const jsonResponse = (body: unknown, status: number) =>
  ({ status, json: () => Promise.resolve(body) }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
  toastMocks.error.mockClear();
  toastMocks.success.mockClear();
});

describe("useShareTrip", () => {
  it("opens the share dialog with the new id on 201", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ id: "abc12345" }, 201)),
    );
    const onCityLimit = vi.fn();
    const { result } = renderHook(() => useShareTrip({ onCityLimit }));

    await act(() => result.current.share(makeTrip()));

    expect(result.current.shareId).toBe("abc12345");
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.sharing).toBe(false);
  });

  it("delegates the city_limit contract to the caller instead of a toast", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "city_limit" }, 403)),
    );
    const onCityLimit = vi.fn();
    const { result } = renderHook(() => useShareTrip({ onCityLimit }));

    await act(() => result.current.share(makeTrip()));

    expect(onCityLimit).toHaveBeenCalledOnce();
    expect(result.current.dialogOpen).toBe(false);
    expect(toastMocks.error).not.toHaveBeenCalled();
  });

  it("shows an in-voice toast for payload-too-large", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 413)));
    const { result } = renderHook(() => useShareTrip({ onCityLimit: vi.fn() }));

    await act(() => result.current.share(makeTrip()));

    expect(toastMocks.error).toHaveBeenCalledWith(
      expect.stringContaining("too big to share"),
    );
  });

  it("shows an in-voice toast for rate limiting", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 429)));
    const { result } = renderHook(() => useShareTrip({ onCityLimit: vi.fn() }));

    await act(() => result.current.share(makeTrip()));

    expect(toastMocks.error).toHaveBeenCalledWith(
      expect.stringContaining("breather"),
    );
  });

  it("shows a generic toast for any other failure status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 500)));
    const { result } = renderHook(() => useShareTrip({ onCityLimit: vi.fn() }));

    await act(() => result.current.share(makeTrip()));

    expect(toastMocks.error).toHaveBeenCalledWith(
      "Couldn't share that map — try again.",
    );
  });

  it("shows a network-error toast when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { result } = renderHook(() => useShareTrip({ onCityLimit: vi.fn() }));

    await act(() => result.current.share(makeTrip()));

    expect(toastMocks.error).toHaveBeenCalledWith(
      expect.stringContaining("Couldn't reach the atlas"),
    );
    await waitFor(() => expect(result.current.sharing).toBe(false));
  });
});
