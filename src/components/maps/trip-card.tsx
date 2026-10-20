"use client";

import {
  CopyPlus,
  FileDown,
  Link2,
  Loader2,
  Pencil,
  RefreshCw,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isShareStale, tripStats, type LocalTripRecord } from "@/lib/trip";

import { RoutePreview } from "./route-preview";

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];
function formatUpdated(updatedAt: number, locale: string): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const deltaMs = updatedAt - Date.now();
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(deltaMs) >= ms)
      return formatter.format(Math.round(deltaMs / ms), unit);
  }
  return formatter.format(0, "minute");
}

/** Whether the last shared link still shows this trip as it is now. */
function ShareStatus({ record }: { readonly record: LocalTripRecord }) {
  const t = useTranslations("Maps.card");
  const locale = useLocale();
  if (!record.shared) return null;
  if (isShareStale(record)) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-brass-text">
        <RefreshCw className="size-3.5 shrink-0" aria-hidden />
        {t("shareStale")}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-xs text-ink-soft">
      <Link2 className="size-3.5 shrink-0" aria-hidden />
      {t.rich("sharedOn", {
        when: formatUpdated(record.shared.at, locale),
        link: (chunks) => (
          <Link
            href={`/t/${record.shared?.id}`}
            className="underline underline-offset-2 hover:text-ink"
          >
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}

export function TripCard({
  record,
  sharing,
  onShare,
  onDuplicate,
  onExport,
  onDelete,
}: {
  readonly record: LocalTripRecord;
  readonly sharing: boolean;
  readonly onShare: () => void;
  readonly onDuplicate: () => void;
  /** Saves the trip as a backup file. */
  readonly onExport: () => void;
  readonly onDelete: () => void;
}) {
  const t = useTranslations("Maps.card");
  const locale = useLocale();
  const stats = tripStats(record.trip);
  const title = record.trip.title;

  return (
    <Card>
      <Link href={`/maps/${record.id}`} aria-label={t("viewTrip", { title })}>
        <RoutePreview cities={record.trip.cities} />
      </Link>

      <CardHeader>
        <CardTitle>{record.trip.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("summary", {
            stops: stats.cities,
            nights: stats.nights,
            updated: formatUpdated(record.updatedAt, locale),
          })}
        </p>
        <ShareStatus record={record} />
      </CardHeader>

      <CardFooter>
        <Button asChild variant="brass" size="sm">
          <Link href={`/maps/${record.id}`}>{t("view")}</Link>
        </Button>

        <div className="flex gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/new?remix=${record.id}`} aria-label={t("edit", { title })}>
              <Pencil />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("share", { title })}
            disabled={sharing}
            onClick={onShare}
          >
            {sharing ? <Loader2 className="animate-spin" /> : <Share2 />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("duplicate", { title })}
            title={t("duplicateHint")}
            onClick={onDuplicate}
          >
            <CopyPlus />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("export", { title })}
            title={t("exportHint")}
            onClick={onExport}
          >
            <FileDown />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("delete", { title })}
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteTitle", { title })}</AlertDialogTitle>
                <AlertDialogDescription>{t("deleteBody")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>
                  {t("confirmDelete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
