"use client";

import { Moon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ShareButton } from "@/components/editor/share-button";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tripStats } from "@/lib/trip";
import type { LocalTrip } from "@/lib/trip";

export function TripCard({
  entry,
  onDelete,
}: {
  readonly entry: LocalTrip;
  readonly onDelete: (id: string) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const stats = tripStats(entry.trip);
  const updated = new Date(entry.trip.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{entry.trip.title}</CardTitle>
        <p className="text-xs text-muted-foreground">Updated {updated}</p>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
        <span>
          {stats.cities} stop{stats.cities === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1">
          <Moon className="size-3.5" /> {stats.nights} night
          {stats.nights === 1 ? "" : "s"}
        </span>
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/new?remix=${entry.id}`}>Open</Link>
          </Button>
          <ShareButton trip={entry.trip} />
        </div>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${entry.trip.title}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this route?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{entry.trip.title}&rdquo; will be removed from this browser.
                This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(entry.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
