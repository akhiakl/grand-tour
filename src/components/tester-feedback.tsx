"use client";

import { useEffect } from "react";

import { usePageIdle } from "@/hooks/use-page-idle";

const TOKEN = process.env.NEXT_PUBLIC_USERBACK_TOKEN;

/**
 * Floating feedback button (screenshot, screen recording, console and
 * network details) for the public test period. Loads nothing unless the
 * `tester-feedback` Vercel Flag is on (checked via `/api/tester-feedback`)
 * and `NEXT_PUBLIC_USERBACK_TOKEN` is set. Delete this file after testing.
 */
export function TesterFeedback() {
  const idle = usePageIdle();

  useEffect(() => {
    if (!TOKEN || !idle) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/tester-feedback");
        const { enabled } = (await response.json()) as { enabled?: boolean };
        if (!enabled || cancelled) return;
        const { default: Userback } = await import("@userback/widget");
        if (!cancelled) void Userback(TOKEN);
      } catch {
        // Best effort: no flag answer means no button.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idle]);

  return null;
}
