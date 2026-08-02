"use client";

import { Compass, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ShareDialog } from "@/components/share/share-dialog";
import { Button } from "@/components/ui/button";
import { UpsellModal } from "@/components/upsell/upsell-modal";
import { useMounted } from "@/hooks/use-mounted";
import { useShareTrip } from "@/hooks/use-share-trip";
import { deleteLocalTrip, listLocalTrips, type LocalTripRecord } from "@/lib/trip";

import { TripCard } from "./trip-card";

export function MapsPage() {
  const mounted = useMounted();
  // Bumped to force a fresh `listLocalTrips()` read after a delete — the
  // store has no subscription mechanism, so this is a manual invalidation.
  const [, forceRefresh] = useState(0);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const records: LocalTripRecord[] = mounted ? listLocalTrips() : [];

  const { share, shareId, dialogOpen, setDialogOpen } = useShareTrip({
    onCityLimit: () => setUpsellOpen(true),
  });

  const handleShare = async (record: LocalTripRecord) => {
    setSharingId(record.id);
    await share(record.trip);
    setSharingId(null);
  };

  const handleDelete = (id: string) => {
    deleteLocalTrip(id);
    forceRefresh((key) => key + 1);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Field Atlas</p>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            My <em className="text-azure italic">Maps</em>
          </h1>
        </div>
        <Button asChild variant="brass">
          <Link href="/new">
            <Plus /> New map
          </Link>
        </Button>
      </header>

      {mounted && records.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Compass className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            No maps yet — build your first route.
          </p>
          <Button asChild variant="outline">
            <Link href="/new">Start building</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {records.map((record) => (
          <TripCard
            key={record.id}
            record={record}
            sharing={sharingId === record.id}
            onShare={() => void handleShare(record)}
            onDelete={() => handleDelete(record.id)}
          />
        ))}
      </div>

      <ShareDialog
        shareId={shareId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <UpsellModal open={upsellOpen} onOpenChange={setUpsellOpen} />
    </div>
  );
}
