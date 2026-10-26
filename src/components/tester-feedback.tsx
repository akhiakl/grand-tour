"use client";

import { useEffect } from "react";

import { usePageIdle } from "@/hooks/use-page-idle";

const TOKEN = process.env.NEXT_PUBLIC_USERBACK_TOKEN;

/**
 * Floating feedback button (screenshot, screen recording, console and
 * network details) for the public test period. Loads nothing unless
 * `NEXT_PUBLIC_USERBACK_TOKEN` is set, so set it only on the environments
 * under test. Delete this file after testing.
 */
export function TesterFeedback() {
  const idle = usePageIdle();

  useEffect(() => {
    if (!TOKEN || !idle) return;
    let cancelled = false;
    void (async () => {
      try {
        const { default: Userback } = await import("@userback/widget");
        if (!cancelled) void Userback(TOKEN);
      } catch (error) {
        console.warn("Userback widget failed to load", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idle]);

  return null;
}
