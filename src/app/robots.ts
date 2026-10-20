import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/http";

/**
 * Crawl the public pages only. Shared maps (`/t/*`) stay crawlable so
 * their `noindex` meta is seen; device-local pages and the API are off.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/new", "/maps"] },
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
