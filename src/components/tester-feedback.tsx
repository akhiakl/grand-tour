"use client";

import { useEffect } from "react";

import { usePageIdle } from "@/hooks/use-page-idle";

const TOKEN = process.env.NEXT_PUBLIC_USERBACK_TOKEN;

/**
 * Floating feedback button (screenshot, screen recording, console and
 * network details) for the public test period. Renders nothing and loads
 * no script unless `NEXT_PUBLIC_USERBACK_TOKEN` is set; remove the
 * variable to switch it off, then delete this file after testing.
 */
export function TesterFeedback() {
  const idle = usePageIdle();

  useEffect(() => {
    if (!TOKEN || !idle) return;
    let cancelled = false;
    void import("@userback/widget").then(({ default: Userback }) => {
      if (!cancelled) void Userback(TOKEN);
    });
    return () => {
      cancelled = true;
    };
  }, [idle]);

  return null;
}
