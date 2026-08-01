"use client";

import { Loader2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { shareTrip } from "@/lib/trip";
import type { Trip } from "@/lib/trip";

import { ShareDialog } from "./share-dialog";
import { UpsellModal } from "./upsell-modal";

export function ShareButton({
  trip,
  disabled,
}: {
  readonly trip: Trip;
  readonly disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    const outcome = await shareTrip(trip);
    setLoading(false);

    if (outcome.kind === "success") {
      setShareId(outcome.id);
      return;
    }
    if (outcome.kind === "city_limit") {
      setUpsellOpen(true);
      return;
    }
    toast.error(outcome.message);
  };

  return (
    <>
      <Button onClick={handleShare} disabled={disabled || loading} variant="brass">
        {loading ? <Loader2 className="animate-spin" /> : <Share2 />}
        Share
      </Button>
      <ShareDialog
        id={shareId}
        open={shareId !== null}
        onOpenChange={(open) => !open && setShareId(null)}
      />
      <UpsellModal open={upsellOpen} onOpenChange={setUpsellOpen} />
    </>
  );
}
