import { getClientIp, getRatelimiter } from "@/lib/http";
import { emit } from "@/lib/logging";
import { GUEST_MAX_CITIES, MAX_TRIP_PAYLOAD_BYTES, TripSchema } from "@/lib/trip";
import { saveTrip } from "@/lib/trip/service";

const ROUTE = "/api/trips";

// Logs the reason only: never the caller's address, the trip or its issues.
const refuse = (
  status: number,
  reason: string,
  body: object = { error: reason },
) => {
  emit("warn", "request refused", { route: ROUTE, status, reason });
  return Response.json(body, { status });
};

export async function POST(request: Request) {
  const { success } = await getRatelimiter("trips").limit(getClientIp(request));
  if (!success) return refuse(429, "rate_limited");

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_TRIP_PAYLOAD_BYTES) {
    return refuse(413, "payload_too_large");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return refuse(400, "invalid_json");
  }

  // The guest ceiling gets its own status so the client shows the upsell,
  // not a generic validation error.
  const cities = (body as { cities?: unknown } | null)?.cities;
  if (Array.isArray(cities) && cities.length > GUEST_MAX_CITIES) {
    return refuse(403, "city_limit", {
      error: "city_limit",
      limit: GUEST_MAX_CITIES,
    });
  }

  const parsed = TripSchema.safeParse(body);
  if (!parsed.success) {
    return refuse(400, "invalid_trip", {
      error: "invalid_trip",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const id = await saveTrip(parsed.data);
    emit("info", "trip shared", { route: ROUTE });
    return Response.json({ id }, { status: 201 });
  } catch {
    emit("error", "save failed", { route: ROUTE, status: 500 });
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
