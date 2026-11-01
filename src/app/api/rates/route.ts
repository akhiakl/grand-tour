import * as z from "zod";

import { emit } from "@/lib/logging";
import { BASE_CURRENCY, type Rates } from "@/lib/units";

/**
 * Frankfurter publishes the ECB reference rates (open source, no key).
 * `RATES_API_URL` can point at a self-hosted instance with the same shape.
 */
const DEFAULT_RATES_URL = `https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}`;

/** ECB rates change once per working day. */
const ONE_DAY = 60 * 60 * 24;

const UpstreamSchema = z.object({
  base: z.literal(BASE_CURRENCY),
  date: z.string(),
  rates: z.record(z.string(), z.number().positive()),
});

/** Live USD exchange rates for display-only budget conversion. */
export async function GET() {
  try {
    const response = await fetch(process.env.RATES_API_URL || DEFAULT_RATES_URL, {
      next: { revalidate: ONE_DAY },
    });
    if (!response.ok) throw new Error(`rates_${response.status}`);

    const parsed = UpstreamSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error("rates_invalid");

    const body: Rates = parsed.data;
    return Response.json(body, {
      headers: {
        "Cache-Control": `public, s-maxage=${ONE_DAY}, stale-while-revalidate=${ONE_DAY}`,
      },
    });
  } catch (error) {
    // Callers fall back to showing USD.
    emit("warn", "rates unavailable", {
      route: "/api/rates",
      status: 503,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: "rates_unavailable" }, { status: 503 });
  }
}
