"use client";

import { useState } from "react";

import type { GenerateRequest } from "@/lib/ai";
import { trackEvent } from "@/lib/analytics";
import type { Trip } from "@/lib/trip";

export type GenerateStatus = "idle" | "drafting" | "rate_limited" | "failed";

export interface GeneratedDraft {
  trip: Trip;
  suggestedExtra: string[];
}

/**
 * One POST to /api/generate, mapped onto the route's error contract:
 * 429 → "rate_limited" (retry later), anything else non-OK or a network
 * error → "failed". Success hands the draft to `onDrafted`.
 */
export function useGenerateTrip({
  onDrafted,
}: {
  /** Receives the draft and the request that produced it. */
  readonly onDrafted: (draft: GeneratedDraft, request: GenerateRequest) => void;
}) {
  const [status, setStatus] = useState<GenerateStatus>("idle");

  const generate = async (request: GenerateRequest) => {
    setStatus("drafting");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        trackEvent("ai_route_generated");
        // Stays "drafting": the chat navigates away; other callers reset().
        onDrafted((await response.json()) as GeneratedDraft, request);
        return;
      }
      setStatus(response.status === 429 ? "rate_limited" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  return { generate, status, reset: () => setStatus("idle") };
}
