import { pingStore } from "@/lib/trip/service";

/**
 * Uptime probe for external monitors: 200 when the app and its store are
 * reachable, 503 otherwise. Not rate limited (monitors poll it) and no
 * configuration in the body. A healthy answer is cached 15 s at the CDN, so
 * Redis sees only a few pings a minute however often this is requested; a
 * failure is never cached, so an outage shows up on the next check.
 */
export async function GET() {
  const up = await pingStore();
  return Response.json(
    up ? { status: "ok", redis: "up" } : { status: "degraded", redis: "down" },
    {
      status: up ? 200 : 503,
      headers: { "Cache-Control": up ? "public, s-maxage=15" : "no-store" },
    },
  );
}
