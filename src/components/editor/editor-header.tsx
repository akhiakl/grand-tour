"use client";

import { ArrowLeft, CircleAlert, Loader2, Map, Share2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const TRIP_TITLE_INPUT_ID = "trip-title";

export function EditorHeader({
  title,
  onTitleChange,
  onShare,
  canShare,
  sharing,
  titleError,
}: {
  readonly title: string;
  readonly onTitleChange: (title: string) => void;
  readonly onShare: () => void;
  readonly canShare: boolean;
  readonly sharing: boolean;
  readonly titleError?: string;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
      <div className="flex min-w-64 flex-1 flex-col gap-2">
        <Link
          href="/"
          className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass-text"
        >
          <ArrowLeft className="size-3" /> Field Atlas
        </Link>
        <Input
          id={TRIP_TITLE_INPUT_ID}
          aria-label="Trip title"
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "trip-title-error" : undefined}
          value={title}
          maxLength={80}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-auto border-none bg-transparent px-0 font-display text-3xl font-medium tracking-tight shadow-none focus-visible:ring-0"
        />
        {titleError && (
          <p
            id="trip-title-error"
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <CircleAlert className="size-3.5 shrink-0" aria-hidden />
            {titleError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline">
          <Link href="/maps">
            <Map /> My Maps
          </Link>
        </Button>
        <Button
          type="button"
          variant="brass"
          size="lg"
          disabled={!canShare || sharing}
          onClick={onShare}
        >
          {sharing ? <Loader2 className="animate-spin" /> : <Share2 />}
          Share
        </Button>
      </div>
    </header>
  );
}
