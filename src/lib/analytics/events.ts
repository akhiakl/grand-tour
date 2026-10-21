import { track } from "@vercel/analytics";

/**
 * The few moments that tell whether the product works. Page views
 * (including shared map opens at /t/{id}) are counted automatically.
 */
export type AnalyticsEvent = "ai_route_generated" | "share_created" | "upsell_shown";

// TODO(analytics): custom events need a Vercel Pro plan; on Hobby these
// calls are dropped and only page views are recorded.
export function trackEvent(event: AnalyticsEvent): void {
  track(event);
}

/**
 * Drops query strings and fragments before an event leaves the browser:
 * they can carry local draft ids (`/new?remix=…`), which aren't ours to log.
 */
export function withoutQuery<T extends { url: string }>(event: T): T {
  const url = new URL(event.url);
  return { ...event, url: `${url.origin}${url.pathname}` };
}
