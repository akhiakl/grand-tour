import "server-only";

import * as Sentry from "@sentry/nextjs";

import { emit, errorFields } from "@/lib/logging";
import { TripSchema, type Trip } from "@/lib/trip";

import { buildRetryPrompt, buildSystemPrompt, buildUserPrompt } from "./prompt";
import { AiTripSchema, clampToGuestLimit, type GenerateRequest } from "./schema";

export type GenerationFailure = "unavailable" | "upstream" | "invalid_output";

export class GenerationError extends Error {
  constructor(
    public readonly reason: GenerationFailure,
    /** HTTP status the model endpoint answered with, when it did. */
    public readonly upstreamStatus?: number,
    /** The provider's short error code, when it sent one. */
    public readonly upstreamCode?: string,
  ) {
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
  /** Optional, sent only when set: not every provider accepts them. */
  reasoningEffort?: string;
  maxTokens?: number;
}

function positiveInt(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function modelConfig(): ModelConfig | null {
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!baseUrl || !model) return null;
  return {
    url: `${baseUrl.replace(/\/+$/, "")}/chat/completions`,
    model,
    apiKey: process.env.AI_API_KEY || undefined,
    reasoningEffort: process.env.AI_REASONING_EFFORT || undefined,
    maxTokens: positiveInt(process.env.AI_MAX_TOKENS),
  };
}

async function callModel(
  messages: ChatMessage[],
  config: ModelConfig,
  attempt: number,
): Promise<string> {
  return await Sentry.startSpan(
    {
      name: "ai.chat_completion",
      op: "gen_ai.chat",
      attributes: { "ai.attempt": attempt },
    },
    () => requestCompletion(messages, config),
  );
}

async function requestCompletion(
  messages: ChatMessage[],
  config: ModelConfig,
): Promise<string> {
  const startedAt = Date.now();
  const fail = (
    detail: string,
    upstreamStatus?: number,
    error?: unknown,
    upstreamCode?: string,
  ) => {
    emit("error", "model call failed", {
      route: "/api/generate",
      model: config.model,
      detail,
      upstreamCode,
      upstreamStatus,
      durationMs: Date.now() - startedAt,
      ...(error === undefined ? {} : errorFields(error)),
    });
    return new GenerationError("upstream", upstreamStatus, upstreamCode);
  };

  let response: Response;
  try {
    response = await fetch(config.url, {
      method: "POST",
      headers: {
        ...(config.apiKey && { authorization: `Bearer ${config.apiKey}` }),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        response_format: { type: "json_object" },
        temperature: 0.6,
        ...(config.reasoningEffort && { reasoning_effort: config.reasoningEffort }),
        ...(config.maxTokens && { max_completion_tokens: config.maxTokens }),
        messages,
      }),
    });
  } catch (error) {
    throw fail("network", undefined, error);
  }

  if (!response.ok) {
    throw fail("http_status", response.status, undefined, await errorCode(response));
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw fail("body_not_json", response.status, error);
  }
  const content = (data as { choices?: { message?: { content?: unknown } }[] })
    .choices?.[0]?.message?.content;

  if (typeof content !== "string") throw fail("no_content", response.status);
  return content;
}

/** The provider's short error code (e.g. json_validate_failed), never its message. */
async function errorCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { error?: { code?: unknown } };
    const code = body.error?.code;
    return typeof code === "string" ? code.slice(0, 60) : undefined;
  } catch {
    return undefined;
  }
}

function tryParse(content: string): { trip: GeneratedTrip } | { issues: string } {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    return { issues: "output was not valid JSON" };
  }

  const parsed = AiTripSchema.safeParse(clampToGuestLimit(json));
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
 * Traced as one span; its attributes are a fixed allowlist with no guest
 * content (destination, prompts and model output stay out of Sentry).
 */
export async function generateTrip(
  request: GenerateRequest,
): Promise<GeneratedTrip> {
  const config = modelConfig();
  if (!config) throw new GenerationError("unavailable");

  return await Sentry.startSpan(
    {
      name: "ai.generate_trip",
      op: "gen_ai.generate",
      attributes: { "ai.model": config.model, "trip.days": request.days },
    },
    async (span) => {
      let attempts = 0;
      const call = (messages: ChatMessage[]) =>
        callModel(messages, config, ++attempts);
      try {
        const result = await draftWithRetry(request, call);
        span.setAttribute("ai.outcome", "ok");
        span.setAttribute("trip.cities", result.trip.cities.length);
        return result;
      } catch (error) {
        span.setAttribute(
          "ai.outcome",
          error instanceof GenerationError ? error.reason : "error",
        );
        throw error;
      } finally {
        span.setAttribute("ai.attempts", attempts);
      }
    },
  );
}

/**
 * Groq rejects a reply it can't parse as JSON with a 400 instead of returning
 * it. The model is non-deterministic, so one more identical call usually works.
 */
async function callWithJsonRetry(
  call: (messages: ChatMessage[]) => Promise<string>,
  messages: ChatMessage[],
): Promise<string> {
  try {
    return await call(messages);
  } catch (error) {
    if (
      error instanceof GenerationError &&
      error.upstreamCode === "json_validate_failed"
    ) {
      return await call(messages);
    }
    throw error;
  }
}

async function draftWithRetry(
  request: GenerateRequest,
  call: (messages: ChatMessage[]) => Promise<string>,
): Promise<GeneratedTrip> {
  const base: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildUserPrompt(request) },
  ];

  const first = await callWithJsonRetry(call, base);
  const firstResult = tryParse(first);
  if ("trip" in firstResult) return firstResult.trip;
  // Issue paths and messages come from our schema, never the model's text.
  emit("warn", "model output rejected, retrying", {
    route: "/api/generate",
    issues: firstResult.issues.slice(0, 300),
  });

  const second = await call([
    ...base,
    { role: "assistant", content: first },
    { role: "user", content: buildRetryPrompt(firstResult.issues) },
  ]);
  const secondResult = tryParse(second);
  if ("trip" in secondResult) return secondResult.trip;

  emit("error", "model output rejected twice", {
    route: "/api/generate",
    issues: secondResult.issues.slice(0, 300),
  });
  throw new GenerationError("invalid_output");
}
