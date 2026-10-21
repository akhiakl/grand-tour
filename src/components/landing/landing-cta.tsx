"use client";

import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CitySearch } from "@/components/editor/city-search";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import type { CitySearchResult } from "@/lib/geo-search";
import { listLocalTrips } from "@/lib/trip";

import { DestinationStart } from "./destination-start";
import { WelcomeBack } from "./welcome-back";

/**
 * The landing's way in, shown as the example route's main actions: pick
 * up a saved map (returning visitors), start with AI or by hand, or name
 * a destination first. The sample route stays below as inspiration.
 */
export function LandingCta() {
  // Saved maps live in this browser only; read them after mount so the
  // server and first client render agree.
  const trips = useMounted() ? listLocalTrips() : [];
  const [destination, setDestination] = useState<CitySearchResult | null>(null);
  const returning = trips.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {returning && <WelcomeBack latest={trips[0]} />}

      {destination ? (
        <DestinationStart
          destination={destination}
          primary={!returning}
          onClear={() => setDestination(null)}
        />
      ) : (
        <div role="group" aria-label="Start your own route" className="flex gap-2">
          <Button
            asChild
            variant={returning ? "outline" : "brass"}
            className="flex-1"
          >
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
      )}

      {/* Under the buttons so they stay in view on the mobile sheet's peek. */}
      <CitySearch
        onSelect={setDestination}
        label="Where to?"
        placeholder={
          returning ? "Or plan somewhere new…" : "Know where? Search a city…"
        }
      />

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
