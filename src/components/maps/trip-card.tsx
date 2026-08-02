"use client";

import { Loader2, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";

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
import { tripStats, type LocalTripRecord } from "@/lib/trip";

import { RoutePreview } from "./route-preview";

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];
const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function formatUpdated(updatedAt: number): string {
  const deltaMs = updatedAt - Date.now();
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(deltaMs) >= ms)
      return formatter.format(Math.round(deltaMs / ms), unit);
  }
  return formatter.format(0, "minute");
}

export function TripCard({
  record,
  sharing,
  onShare,
  onDelete,
}: {
  readonly record: LocalTripRecord;
  readonly sharing: boolean;
  readonly onShare: () => void;
  readonly onDelete: () => void;
}) {
  const stats = tripStats(record.trip);

  return (
    <Card>
      <Link href={`/maps/${record.id}`} aria-label={`View ${record.trip.title}`}>
        <RoutePreview cities={record.trip.cities} />
      </Link>

      <CardHeader>
        <CardTitle>{record.trip.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {stats.cities} stops · {stats.nights} nights · Updated{" "}
          {formatUpdated(record.updatedAt)}
        </p>
      </CardHeader>

      <CardFooter>
        <Button asChild variant="brass" size="sm">
          <Link href={`/maps/${record.id}`}>View</Link>
        </Button>

        <div className="flex gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link
              href={`/new?remix=${record.id}`}
              aria-label={`Edit ${record.trip.title}`}
            >
              <Pencil />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Share ${record.trip.title}`}
            disabled={sharing}
            onClick={onShare}
          >
            {sharing ? <Loader2 className="animate-spin" /> : <Share2 />}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${record.trip.title}`}
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {record.trip.title}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes it from My Maps on this device. Any link you&apos;ve
                  already shared keeps working.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
