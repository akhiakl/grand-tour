"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const EASE_ATLAS = [0.32, 0.72, 0.24, 1] as const;

/** One message in the guided chat: the atlas speaks left, the guest right. */
export function ChatBubble({
  from,
  children,
}: {
  readonly from: "atlas" | "guest";
  readonly children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <m.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_ATLAS }}
      className={cn(
        "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
        from === "atlas"
          ? "frost self-start rounded-2xl rounded-bl-md text-ink"
          : "self-end rounded-2xl rounded-br-md border border-brass/40 bg-brass/10 text-ink",
      )}
    >
      {children}
    </m.div>
  );
}
