import { GenerateRequestSchema } from "@/lib/ai";
import { GenerationError, generateTrip } from "@/lib/ai/generate";
import { getClientIp, getRatelimiter } from "@/lib/http";
import { emit } from "@/lib/logging";

const FAILURE_RESPONSES = {
  unavailable: { status: 503, error: "generation_unavailable" },
  upstream: { status: 502, error: "generation_failed" },
  invalid_output: { status: 502, error: "generation_failed" },
} as const;

// Logs the reason only: never the caller's address or the prompt.
const refuse = (status: number, reason: string) => {
  emit("warn", "request refused", { route: "/api/generate", status, reason });
  return Response.json({ error: reason }, { status });
};

export async function POST(request: Request) {
  const { success } = await getRatelimiter("generate").limit(getClientIp(request));
  if (!success) return refuse(429, "rate_limited");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return refuse(400, "invalid_json");
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) return refuse(400, "invalid_request");

  try {
    // Generated trips are NOT saved — the client lands them in the editor.
    const result = await generateTrip(parsed.data);
    emit("info", "trip generated", { route: "/api/generate" });
    return Response.json(result);
  } catch (error) {
    if (error instanceof GenerationError) {
      const { status, error: code } = FAILURE_RESPONSES[error.reason];
      emit("error", "generation failed", {
        route: "/api/generate",
        status,
        reason: error.reason,
      });
      return Response.json({ error: code }, { status });
    }
    emit("error", "generation failed", {
      route: "/api/generate",
      status: 500,
      reason: "unexpected",
    });
    return Response.json({ error: "generation_failed" }, { status: 500 });
  }
}
