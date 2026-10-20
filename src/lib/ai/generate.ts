import "server-only";

import { TripSchema, type Trip } from "@/lib/trip";

import { buildRetryPrompt, buildSystemPrompt, buildUserPrompt } from "./prompt";
import { AiTripSchema, type GenerateRequest } from "./schema";

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

/** Any OpenAI-compatible chat endpoint (Ollama, vLLM, llama.cpp, ...). */
interface ModelConfig {
  url: string;
  model: string;
  apiKey?: string;
}

function modelConfig(): ModelConfig | null {
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!baseUrl || !model) return null;
  return {
    url: `${baseUrl.replace(/\/+$/, "")}/chat/completions`,
    model,
    apiKey: process.env.AI_API_KEY || undefined,
  };
}

async function callModel(
  messages: ChatMessage[],
  config: ModelConfig,
): Promise<string> {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      ...(config.apiKey && { authorization: `Bearer ${config.apiKey}` }),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
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
  const config = modelConfig();
  if (!config) throw new GenerationError("unavailable");

  const base: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(request) },
  ];

  const first = await callModel(base, config);
  const firstResult = tryParse(first);
  if ("trip" in firstResult) return firstResult.trip;

  const second = await callModel(
    [
      ...base,
      { role: "assistant", content: first },
      { role: "user", content: buildRetryPrompt(firstResult.issues) },
    ],
    config,
  );
  const secondResult = tryParse(second);
  if ("trip" in secondResult) return secondResult.trip;

  throw new GenerationError("invalid_output");
}
