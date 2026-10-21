"use client";

import { Analytics } from "@vercel/analytics/next";

import { withoutQuery } from "@/lib/analytics";

/** Cookieless page views; query strings never leave the browser. */
export function SiteAnalytics() {
  return <Analytics beforeSend={withoutQuery} />;
}
