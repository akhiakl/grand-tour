"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { withoutQuery } from "@/lib/analytics";

/**
 * Cookieless page views and real-user Core Web Vitals (the release's
 * performance gate); query strings never leave the browser.
 */
export function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={withoutQuery} />
      <SpeedInsights beforeSend={withoutQuery} />
    </>
  );
}
