"use client";

import { ArrowLeft, Compass, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { downloadFile } from "@/components/download-file";
import { accent } from "@/components/rich-text";
import { ShareDialog } from "@/components/share/share-dialog";
import { Button } from "@/components/ui/button";
import { UpsellModal } from "@/components/upsell/upsell-modal";
import { useMounted } from "@/hooks/use-mounted";
import { useShareTrip } from "@/hooks/use-share-trip";
import {
  deleteLocalTrip,
  duplicateLocalTrip,
  importLocalTrip,
  listLocalTrips,
  serializeTripFile,
  tripFileSlug,
  type LocalTripRecord,
  type Trip,
} from "@/lib/trip";

import { ImportTripButton } from "./import-trip-button";
import { TripCard } from "./trip-card";

export function MapsPage() {
  const mounted = useMounted();
  const t = useTranslations("Maps");
  const common = useTranslations("Common");
  // Bumped to force a fresh `listLocalTrips()` read after a delete — the
  // store has no subscription mechanism, so this is a manual invalidation.
  const [, forceRefresh] = useState(0);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const records: LocalTripRecord[] = mounted ? listLocalTrips() : [];

  const { share, shareId, sharedTitle, dialogOpen, setDialogOpen } = useShareTrip({
    onCityLimit: () => setUpsellOpen(true),
    onShared: () => refresh(),
  });

  const handleShare = async (record: LocalTripRecord) => {
    setSharingId(record.id);
    await share(record.trip, record.id);
    setSharingId(null);
  };

  const refresh = () => forceRefresh((key) => key + 1);

  const handleDelete = (id: string) => {
    deleteLocalTrip(id);
    refresh();
  };

  const handleDuplicate = (record: LocalTripRecord) => {
    duplicateLocalTrip(record.id);
    refresh();
  };

  const handleExport = ({ trip }: LocalTripRecord) =>
    downloadFile(
      `${tripFileSlug(trip.title)}.grand-tour.json`,
      serializeTripFile(trip),
      "application/json",
    );

  const handleImport = (trip: Trip) => {
    importLocalTrip(trip);
    refresh();
    toast.success(t("imported", { title: trip.title }));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <Link
            href="/"
            className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass-text"
          >
            <ArrowLeft className="size-3" /> {common("backToAtlas")}
          </Link>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            {t.rich("title", { em: accent })}
          </h1>
        </div>
        <div className="flex gap-2">
          <ImportTripButton onImport={handleImport} />
          <Button asChild variant="brass">
            <Link href="/new">
              <Plus /> {t("newMap")}
            </Link>
          </Button>
        </div>
      </header>

      {mounted && records.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Compass className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{t("empty")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="brass">
              <Link href="/plan">
                <Sparkles /> {t("planWithAi")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/new">{t("buildManually")}</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {records.map((record) => (
          <TripCard
            key={record.id}
            record={record}
            sharing={sharingId === record.id}
            onShare={() => void handleShare(record)}
            onDuplicate={() => handleDuplicate(record)}
            onExport={() => handleExport(record)}
            onDelete={() => handleDelete(record.id)}
          />
        ))}
      </div>

      <ShareDialog
        shareId={shareId}
        title={sharedTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <UpsellModal open={upsellOpen} onOpenChange={setUpsellOpen} />
    </div>
  );
}
