import { Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SharedTripNotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Compass className="size-10 text-muted-foreground" />
        <p className="eyebrow">Off the map</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          This map has expired
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Shared routes stay live for 60 days after their last visit — this
          one&apos;s trail has gone cold. You can always draw a new one.
        </p>
        <Button asChild variant="brass" className="mt-2">
          <Link href="/new">Create your own</Link>
        </Button>
      </div>
    </div>
  );
}
