import { describe, expect, it } from "vitest";

import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL", () => {
    expect(
      siteUrl({
        NEXT_PUBLIC_SITE_URL: "https://grandtour.example",
        VERCEL_PROJECT_PRODUCTION_URL: "gt.vercel.app",
      }).origin,
    ).toBe("https://grandtour.example");
  });

  it("falls back to the Vercel production host over https", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "gt.vercel.app" }).origin).toBe(
      "https://gt.vercel.app",
    );
  });

  it("skips malformed values and ends at localhost", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "not a url", PORT: "4000" }).origin).toBe(
      "http://localhost:4000",
    );
    expect(siteUrl({}).origin).toBe("http://localhost:3000");
  });
});
