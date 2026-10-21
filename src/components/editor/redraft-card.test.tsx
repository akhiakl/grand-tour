import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeGeneratedDraft, makeGenerateRequest } from "@/test/fixtures/ai";

import { RedraftCard } from "./redraft-card";

const fetchMock = vi.fn();
const onDrafted = vi.fn();

const jsonResponse = (body: unknown, status: number) =>
  ({ ok: status < 300, status, json: () => Promise.resolve(body) }) as Response;

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("RedraftCard", () => {
  it("sends the edited answers and hands back the redraft", async () => {
    const draft = makeGeneratedDraft();
    fetchMock.mockResolvedValue(jsonResponse(draft, 200));
    render(<RedraftCard defaults={makeGenerateRequest()} onDrafted={onDrafted} />);

    await userEvent.click(screen.getByRole("radio", { name: "Relaxed" }));
    const days = screen.getByLabelText("Days");
    await userEvent.clear(days);
    await userEvent.type(days, "9");
    await userEvent.click(screen.getByRole("button", { name: "Redraft route" }));

    const expected = makeGenerateRequest({ days: 9, vibe: "relaxed" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(expected);
    expect(onDrafted).toHaveBeenCalledWith(draft, expected);
    expect(screen.getByRole("button", { name: "Redraft route" })).toBeEnabled();
  });

  it("won't send an out-of-range request", async () => {
    render(<RedraftCard defaults={makeGenerateRequest()} onDrafted={onDrafted} />);
    const days = screen.getByLabelText("Days");
    await userEvent.clear(days);
    await userEvent.type(days, "45");
    expect(screen.getByRole("button", { name: "Redraft route" })).toBeDisabled();
  });

  it("explains a rate limit without touching the route", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 429));
    render(<RedraftCard defaults={makeGenerateRequest()} onDrafted={onDrafted} />);
    await userEvent.click(screen.getByRole("button", { name: "Redraft route" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/breather/);
    expect(onDrafted).not.toHaveBeenCalled();
  });
});
