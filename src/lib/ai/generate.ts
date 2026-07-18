import "server-only";

import { TripSchema, type Trip } from "@/lib/trip";

import { buildRetryPrompt, buildSystemPrompt, buildUserPrompt } from "./prompt";
import { AiTripSchema, type GenerateRequest } from "./schema";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type GenerationFailure = "unavailable" | "upstream" | "invalid_output";

export class GenerationError extends Error {
  constructor(public readonly reason: GenerationFailure) {
    super(`trip generation failed: ${reason}`);
    this.name = "GenerationError";
  }
}

export interface GeneratedTrip {
  trip: Trip;
  /** City names beyond the guest limit — feeds the ghost-stop upsell. */
  suggestedExtra: string[];
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGroq(messages: ChatMessage[], apiKey: string): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.6,
      messages,
    }),
  });

  if (!response.ok) throw new GenerationError("upstream");

  const data: unknown = await response.json();
  const content = (data as { choices?: { message?: { content?: unknown } }[] })
    .choices?.[0]?.message?.content;

  if (typeof content !== "string") throw new GenerationError("upstream");
  return content;
}

function tryParse(content: string): { trip: GeneratedTrip } | { issues: string } {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    return { issues: "output was not valid JSON" };
  }

  const parsed = AiTripSchema.safeParse(json);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n"),
    };
  }

  const { suggestedExtra, ...aiTrip } = parsed.data;
  const trip = TripSchema.parse({
    v: 1,
    ...aiTrip,
    createdBy: "guest",
    createdAt: Date.now(),
  });
  return { trip: { trip, suggestedExtra } };
}

/**
 * One generation call, one retry with validation errors fed back.
 * Throws GenerationError; never returns a partially valid trip.
 */
export async function generateTrip(
  request: GenerateRequest,
): Promise<GeneratedTrip> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new GenerationError("unavailable");

  const base: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(request) },
  ];

  const first = await callGroq(base, apiKey);
  const firstResult = tryParse(first);
  if ("trip" in firstResult) return firstResult.trip;

  const second = await callGroq(
    [
      ...base,
      { role: "assistant", content: first },
      { role: "user", content: buildRetryPrompt(firstResult.issues) },
    ],
    apiKey,
  );
  const secondResult = tryParse(second);
  if ("trip" in secondResult) return secondResult.trip;

  throw new GenerationError("invalid_output");
}
