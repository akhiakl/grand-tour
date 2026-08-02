"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Trip } from "@/lib/trip";

/**
 * POST /api/trips and surface its full error contract as toasts, except
 * `city_limit` (403) which the caller handles itself — that one opens the
 * UpsellModal instead of a toast.
 */
export function useShareTrip({ onCityLimit }: { readonly onCityLimit: () => void }) {
  const [sharing, setSharing] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const share = async (trip: Trip) => {
    setSharing(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });

      if (response.status === 201) {
        const { id } = (await response.json()) as { id: string };
        setShareId(id);
        setDialogOpen(true);
        return;
      }

      if (response.status === 403) {
        onCityLimit();
        return;
      }

      if (response.status === 413) {
        toast.error("That map is too big to share — trim a few details and retry.");
        return;
      }

      if (response.status === 429) {
        toast.error("The atlas needs a breather — try sharing again shortly.");
        return;
      }

      toast.error("Couldn't share that map — try again.");
    } catch {
      toast.error("Couldn't reach the atlas — check your connection and retry.");
    } finally {
      setSharing(false);
    }
  };

  return { share, sharing, shareId, dialogOpen, setDialogOpen };
}
