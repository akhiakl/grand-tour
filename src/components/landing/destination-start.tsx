import { PenLine, Sparkles, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { planHref } from "@/lib/ai";
import type { CitySearchResult } from "@/lib/geo-search";
import { startCityQuery } from "@/lib/trip";

/**
 * Two ways on from a picked destination: let the AI draft the whole route
 * there, or start the editor with it as the first stop.
 */
export function DestinationStart({
  destination,
  primary,
  onClear,
}: {
  readonly destination: CitySearchResult;
  /** False when another action (Continue) already holds the brass slot. */
  readonly primary: boolean;
  readonly onClear: () => void;
}) {
  const place = destination.country
    ? `${destination.name}, ${destination.country}`
    : destination.name;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm text-ink">
        <span className="truncate">
          {destination.flag} {place}
        </span>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear destination"
          className="rounded-full p-1 text-muted-foreground outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      </div>
      <fieldset className="flex gap-2">
        <legend className="sr-only">Start a route to {place}</legend>
        <Button asChild variant={primary ? "brass" : "outline"} className="flex-1">
          <Link href={planHref(place)}>
            <Sparkles /> Plan with AI
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/new?${startCityQuery(destination)}`}>
            <PenLine /> Build manually
          </Link>
        </Button>
      </fieldset>
    </div>
  );
}
