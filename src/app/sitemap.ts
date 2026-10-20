import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/http";

/** The two public entry points; shared maps are private-by-link. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["/", "/plan"].map((path) => ({
    url: new URL(path, base).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
