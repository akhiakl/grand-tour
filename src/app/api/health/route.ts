import { pingStore } from "@/lib/trip/service";

/**
 * Uptime probe for external monitors: 200 when the app and its store are
 * reachable, 503 otherwise. No rate limit (monitors poll it) and no
 * configuration in the body.
 */
export async function GET() {
  const up = await pingStore();
  return Response.json(
    up ? { status: "ok", redis: "up" } : { status: "degraded", redis: "down" },
    { status: up ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
