"use client";

import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Loader2,
  Map,
  Redo2,
  RefreshCw,
  Share2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const TRIP_TITLE_INPUT_ID = "trip-title";
export const TRIP_START_INPUT_ID = "trip-start-date";

function FieldError({
  id,
  message,
}: {
  readonly id: string;
  readonly message: string;
}) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-destructive">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

/** Optional first day: dates the itinerary and unlocks calendar export. */
function StartDateField({
  value,
  onChange,
  error,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
}) {
  const t = useTranslations("Editor");
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <CalendarDays className="size-4 shrink-0" aria-hidden />
        <label htmlFor={TRIP_START_INPUT_ID}>{t("startsLabel")}</label>
        <Input
          id={TRIP_START_INPUT_ID}
          type="date"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "trip-start-error" : "trip-start-hint"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-auto"
        />
        {!error && (
          <span id="trip-start-hint" className="text-xs">
            {t("startsHint")}
          </span>
        )}
      </div>
      {error && <FieldError id="trip-start-error" message={error} />}
    </div>
  );
}

export function EditorHeader({
  title,
  onTitleChange,
  onShare,
  canShare,
  sharing,
  titleError,
  shareStale,
  startDate,
  onStartDateChange,
  startDateError,
  history,
}: {
  readonly title: string;
  readonly onTitleChange: (title: string) => void;
  readonly onShare: () => void;
  readonly canShare: boolean;
  readonly sharing: boolean;
  readonly titleError?: string;
  /** Edited since its last share: the link still shows the older version. */
  readonly shareStale?: boolean;
  readonly startDate: string;
  readonly onStartDateChange: (value: string) => void;
  readonly startDateError?: string;
  readonly history: {
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly onUndo: () => void;
    readonly onRedo: () => void;
  };
}) {
  const t = useTranslations("Editor");
  const common = useTranslations("Common");
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
      <div className="flex min-w-64 flex-1 flex-col gap-2">
        <Link
          href="/"
          className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass-text"
        >
          <ArrowLeft className="size-3" /> {common("backToAtlas")}
        </Link>
        <Input
          id={TRIP_TITLE_INPUT_ID}
          aria-label={t("titleLabel")}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "trip-title-error" : undefined}
          value={title}
          maxLength={80}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-auto border-none bg-transparent px-0 font-display text-3xl font-medium tracking-tight shadow-none focus-visible:ring-0"
        />
        {titleError && <FieldError id="trip-title-error" message={titleError} />}
        <StartDateField
          value={startDate}
          onChange={onStartDateChange}
          error={startDateError}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {shareStale && (
          <p className="flex w-full items-center justify-end gap-1.5 text-xs text-brass-text">
            <RefreshCw className="size-3.5 shrink-0" aria-hidden />
            {t("shareStale")}
          </p>
        )}
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("undo")}
            title={t("undoHint")}
            aria-keyshortcuts="Control+Z Meta+Z"
            disabled={!history.canUndo}
            onClick={history.onUndo}
          >
            <Undo2 />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("redo")}
            title={t("redoHint")}
            aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
            disabled={!history.canRedo}
            onClick={history.onRedo}
          >
            <Redo2 />
          </Button>
        </div>
        <Button asChild variant="outline">
          <Link href="/maps">
            <Map /> {t("myMaps")}
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
          {t("share")}
        </Button>
      </div>
    </header>
  );
}
