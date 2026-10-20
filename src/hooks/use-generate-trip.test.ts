import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeGenerateRequest, makeGeneratedDraft } from "@/test/fixtures/ai";

import { useGenerateTrip } from "./use-generate-trip";

const jsonResponse = (body: unknown, status: number) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGenerateTrip", () => {
  it("posts the answers once and hands the draft over on success", async () => {
    const draft = makeGeneratedDraft();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(draft, 200));
    vi.stubGlobal("fetch", fetchMock);
    const onDrafted = vi.fn();
    const { result } = renderHook(() => useGenerateTrip({ onDrafted }));

    await act(() => result.current.generate(makeGenerateRequest()));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/generate");
    expect(JSON.parse(init.body)).toEqual(makeGenerateRequest());
    expect(onDrafted).toHaveBeenCalledWith(draft, makeGenerateRequest());
    expect(result.current.status).toBe("drafting");
  });

  it.each([
    [429, "rate_limited"],
    [502, "failed"],
    [503, "failed"],
  ])("maps HTTP %i to %s", async (status, expected) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, status)));
    const onDrafted = vi.fn();
    const { result } = renderHook(() => useGenerateTrip({ onDrafted }));

    await act(() => result.current.generate(makeGenerateRequest()));

    expect(result.current.status).toBe(expected);
    expect(onDrafted).not.toHaveBeenCalled();
  });

  it("treats a network error as failed and can reset to idle", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const { result } = renderHook(() => useGenerateTrip({ onDrafted: vi.fn() }));

    await act(() => result.current.generate(makeGenerateRequest()));
    expect(result.current.status).toBe("failed");

    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
  });
});
