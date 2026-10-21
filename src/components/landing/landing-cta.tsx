import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * The landing's way in, shown as the example route's main actions in the
 * trip panel: draft a route with AI or build one by hand.
 */
export function LandingCta() {
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Start your own route" className="flex gap-2">
        <Button asChild variant="brass" className="flex-1">
          <Link href="/plan">
            <Sparkles /> Plan with AI
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/new">
            <PenLine /> Build manually
          </Link>
        </Button>
      </div>
      <Link
        href="/about"
        className="inline-flex w-fit items-center gap-1 rounded-sm text-xs text-ink-soft underline-offset-4 outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        Free, no account needed · How it works{" "}
        <ArrowRight aria-hidden className="size-3" />
      </Link>
    </div>
  );
}
