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
    <div className="page-container py-8 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <Link
            href="/"
            className="eyebrow inline-flex w-fit items-center gap-1.5 rounded-sm text-muted-foreground transition-colors outline-none hover:text-brass-text focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden className="size-3.5" /> {common("backToAtlas")}
          </Link>
          <h1 className="mt-3 font-display text-section font-medium tracking-tight">
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
        <div className="mt-24 flex flex-col items-center gap-5 text-center">
          <Compass aria-hidden className="size-12 text-brass-text" />
          <p className="max-w-[40ch] text-lead text-ink-soft">{t("empty")}</p>
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

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
