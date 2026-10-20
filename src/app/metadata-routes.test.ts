import { afterEach, describe, expect, it, vi } from "vitest";

import manifest from "./manifest";
import robots from "./robots";
import sitemap from "./sitemap";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("metadata routes", () => {
  it("points robots at the absolute sitemap and keeps device pages out", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://grandtour.example");
    const result = robots();
    expect(result.sitemap).toBe("https://grandtour.example/sitemap.xml");
    expect(result.rules).toMatchObject({ disallow: ["/api/", "/new", "/maps"] });
  });

  it("lists only the public entry points in the sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://grandtour.example");
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://grandtour.example/",
      "https://grandtour.example/plan",
    ]);
  });

  it("ships installable PNG icons in the manifest", () => {
    const sizes = manifest().icons?.map((icon) => icon.sizes);
    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  });
});
