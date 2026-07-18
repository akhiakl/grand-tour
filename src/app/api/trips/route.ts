import { getClientIp, getRatelimiter } from "@/lib/http";
import { GUEST_MAX_CITIES, MAX_TRIP_PAYLOAD_BYTES, TripSchema } from "@/lib/trip";
import { saveTrip } from "@/lib/trip/service";

export async function POST(request: Request) {
  const { success } = await getRatelimiter("trips").limit(getClientIp(request));
  if (!success) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_TRIP_PAYLOAD_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // The guest ceiling gets its own status so the client shows the upsell,
  // not a generic validation error.
  const cities = (body as { cities?: unknown } | null)?.cities;
  if (Array.isArray(cities) && cities.length > GUEST_MAX_CITIES) {
    return Response.json(
      { error: "city_limit", limit: GUEST_MAX_CITIES },
      { status: 403 },
    );
  }

  const parsed = TripSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "invalid_trip",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const id = await saveTrip(parsed.data);
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}
