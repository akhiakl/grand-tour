import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { LocalTripRecord } from "@/lib/trip";

/**
 * For returning visitors: their latest map comes before any inspiration.
 * (The card's tool row already links to all of them under My maps.)
 */
export function WelcomeBack({ latest }: { readonly latest: LocalTripRecord }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow">Welcome back</p>
      <Button asChild variant="brass">
        <Link href={`/maps/${latest.id}`}>
          <span className="truncate">Continue {latest.trip.title}</span>
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
