import { GenerationError, generateTrip } from "@/lib/ai/generate";
import { GenerateRequestSchema } from "@/lib/ai/schema";
import { getClientIp, getRatelimiter } from "@/lib/ratelimit";

const FAILURE_RESPONSES = {
  unavailable: { status: 503, error: "generation_unavailable" },
  upstream: { status: 502, error: "generation_failed" },
  invalid_output: { status: 502, error: "generation_failed" },
} as const;

export async function POST(request: Request) {
  const { success } = await getRatelimiter("generate").limit(getClientIp(request));
  if (!success) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    // Generated trips are NOT saved — the client lands them in the editor.
    const result = await generateTrip(parsed.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof GenerationError) {
      const { status, error: code } = FAILURE_RESPONSES[error.reason];
      return Response.json({ error: code }, { status });
    }
    return Response.json({ error: "generation_failed" }, { status: 500 });
  }
}
