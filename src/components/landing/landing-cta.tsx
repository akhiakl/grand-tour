"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Map, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";

import { INTRO_HOLD_MS } from "@/components/trip/intro-splash";
import { Button } from "@/components/ui/button";

const EASE_ATLAS = [0.32, 0.72, 0.24, 1] as const;

/**
 * The landing's way in: a frost card floating above the timeline rail on
 * `/`. Large screens get the full card; smaller ones a compact button row
 * so the demo route stays visible (the top bar's My Maps chip covers that
 * journey there). Appears once the intro splash lifts.
 */
export function LandingCta() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.aside
      aria-label="Start your own route"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_ATLAS, delay: INTRO_HOLD_MS / 1000 }}
      className="frost fixed inset-x-4 bottom-[132px] z-40 flex items-center gap-2 rounded-2xl p-2 sm:inset-x-auto sm:right-7 lg:w-72 lg:flex-col lg:items-stretch lg:gap-3 lg:rounded-[20px] lg:p-5"
    >
      <div className="hidden lg:block">
        <p className="eyebrow">Your route, drawn</p>
        <p className="mt-1 font-display text-2xl font-medium tracking-tight text-ink">
          Where to <em className="text-azure italic">next</em>?
        </p>
      </div>
      <Button asChild variant="brass" className="flex-1 lg:flex-none">
        <Link href="/plan">
          <Sparkles /> Plan with AI
        </Link>
      </Button>
      <Button asChild variant="outline" className="flex-1 lg:flex-none">
        <Link href="/new">
          <PenLine /> Build manually
        </Link>
      </Button>
      <Link
        href="/maps"
        className="hidden items-center justify-center gap-1.5 lg:inline-flex rounded-full px-3 py-2 text-sm text-ink-soft transition-colors outline-none hover:text-brass-text focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Map className="size-4" />
        <span>My maps</span>
      </Link>
    </motion.aside>
  );
}
