"use client";

import { useState } from "react";

import type { GenerateRequest } from "@/lib/ai";
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
  readonly onDrafted: (draft: GeneratedDraft) => void;
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
        onDrafted((await response.json()) as GeneratedDraft);
        return;
      }
      setStatus(response.status === 429 ? "rate_limited" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  return { generate, status, reset: () => setStatus("idle") };
}
