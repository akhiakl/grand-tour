"use client";

import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EditorHeader({
  title,
  onTitleChange,
  onShare,
  canShare,
  sharing,
}: {
  readonly title: string;
  readonly onTitleChange: (title: string) => void;
  readonly onShare: () => void;
  readonly canShare: boolean;
  readonly sharing: boolean;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link
          href="/"
          className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass"
        >
          <ArrowLeft className="size-3" /> Field Atlas
        </Link>
        <Input
          aria-label="Trip title"
          value={title}
          maxLength={80}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-auto border-none bg-transparent px-0 font-display text-3xl font-medium tracking-tight shadow-none focus-visible:ring-0"
        />
      </div>

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
    </header>
  );
}
