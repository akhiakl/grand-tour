import { beforeEach, describe, expect, it, vi } from "vitest";

import { trackEvent, withoutQuery } from ".";

const track = vi.hoisted(() => vi.fn());
vi.mock("@vercel/analytics", () => ({ track }));

beforeEach(() => {
  track.mockClear();
});

describe("trackEvent", () => {
  it("forwards the event name to the provider", () => {
    trackEvent("share_created");
    expect(track).toHaveBeenCalledWith("share_created");
  });
});

describe("withoutQuery", () => {
  it("strips query strings and fragments", () => {
    const event = {
      type: "pageview" as const,
      url: "https://x.test/new?remix=ab12cd34#top",
    };
    expect(withoutQuery(event)).toEqual({
      type: "pageview",
      url: "https://x.test/new",
    });
  });

  it("leaves clean URLs unchanged", () => {
    const event = { type: "event" as const, url: "https://x.test/t/abc12345" };
    expect(withoutQuery(event)).toEqual(event);
  });
});
