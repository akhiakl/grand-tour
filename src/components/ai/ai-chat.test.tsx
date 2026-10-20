import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readAndClearAiHandoff } from "@/lib/ai";
import { makeGeneratedDraft } from "@/test/fixtures/ai";

import { AiChat } from "./ai-chat";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const jsonResponse = (body: unknown, status: number) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Response;

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  router.push.mockReset();
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function answerAll() {
  const user = userEvent.setup();
  render(<AiChat />);
  await user.type(screen.getByLabelText("Destination"), "Austria");
  await user.click(screen.getByRole("button", { name: /next/i }));
  const days = screen.getByLabelText("Number of days");
  await user.clear(days);
  await user.type(days, "6");
  await user.click(screen.getByRole("button", { name: /next/i }));
  await user.click(screen.getByRole("button", { name: /balanced/i }));
  return user;
}

describe("AiChat", () => {
  it("asks three questions, makes one request and lands the draft in the editor", async () => {
    const draft = makeGeneratedDraft(["Ljubljana"]);
    fetchMock.mockResolvedValue(jsonResponse(draft, 200));

    await answerAll();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      destination: "Austria",
      days: 6,
      vibe: "balanced",
    });
    expect(router.push).toHaveBeenCalledWith("/new?from=ai");
    expect(readAndClearAiHandoff()).toMatchObject({
      title: draft.trip.title,
      cities: draft.trip.cities,
      suggestedExtra: ["Ljubljana"],
    });
  });

  it("shows the breather state on 429 and retries with the same answers", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "rate_limited" }, 429))
      .mockResolvedValueOnce(jsonResponse(makeGeneratedDraft(), 200));

    const user = await answerAll();

    expect(await screen.findByRole("alert")).toHaveTextContent("needs a breather");
    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].body).toBe(fetchMock.mock.calls[0][1].body);
    expect(router.push).toHaveBeenCalledWith("/new?from=ai");
  });

  it("offers a blank editor when generation fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "generation_failed" }, 502));

    await answerAll();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "didn't come together",
    );
    expect(screen.getByRole("link", { name: /build it by hand/i })).toHaveAttribute(
      "href",
      "/new",
    );
    expect(router.push).not.toHaveBeenCalled();
  });

  it("keeps Next disabled until the answer is valid", async () => {
    const user = userEvent.setup();
    render(<AiChat />);

    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    await user.type(screen.getByLabelText("Destination"), "Austria{Enter}");

    const days = screen.getByLabelText("Number of days");
    await user.clear(days);
    await user.type(days, "45");
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });
});
