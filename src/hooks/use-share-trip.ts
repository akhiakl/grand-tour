"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { markLocalTripShared, type Trip } from "@/lib/trip";

/**
 * POST /api/trips and surface its full error contract as toasts, except
 * `city_limit` (403) which the caller handles itself — that one opens the
 * UpsellModal instead of a toast. Sharing a local trip (`localId`) records
 * the share on it, so My Maps can tell when it has been edited since.
 */
export function useShareTrip({
  onCityLimit,
  onShared,
}: {
  readonly onCityLimit: () => void;
  readonly onShared?: (shareId: string) => void;
}) {
  const t = useTranslations("Share.errors");
  const [sharing, setSharing] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [sharedTitle, setSharedTitle] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const share = async (trip: Trip, localId?: string) => {
    setSharing(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      });

      if (response.status === 201) {
        const { id } = (await response.json()) as { id: string };
        if (localId) markLocalTripShared(localId, id);
        trackEvent("share_created");
        setShareId(id);
        setSharedTitle(trip.title);
        setDialogOpen(true);
        onShared?.(id);
        return;
      }

      if (response.status === 403) {
        onCityLimit();
        return;
      }

      if (response.status === 413) {
        toast.error(t("tooLarge"));
        return;
      }

      if (response.status === 429) {
        toast.error(t("rateLimited"));
        return;
      }

      toast.error(t("failed"));
    } catch {
      toast.error(t("offline"));
    } finally {
      setSharing(false);
    }
  };

  return { share, sharing, shareId, sharedTitle, dialogOpen, setDialogOpen };
}
