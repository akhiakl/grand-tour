"use client";

import {
  Backpack,
  CalendarPlus,
  ImageDown,
  Map,
  Navigation,
  NotebookPen,
  Pencil,
  Plus,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Which page hosts the experience. "demo" (`/`): the example route, with
 * the landing CTA as its main action. "shared" (`/t/[id]`): remix a copy
 * or start fresh. "own" (`/maps/[id]`): edit in place or share it.
 */
export type ExperienceVariant = "demo" | "shared" | "own";

export type ToolId = "packing" | "notes";

/** The one or two things a visitor most likely came to do. */
export function PrimaryActions({
  variant,
  cta,
  onEditRoute,
  onShare,
  sharing,
}: {
  readonly variant: ExperienceVariant;
  readonly cta?: ReactNode;
  readonly onEditRoute: () => void;
  readonly onShare?: () => void;
  readonly sharing?: boolean;
}) {
  const t = useTranslations("Trip.actions");
  if (variant === "demo" && cta) return cta;

  if (variant === "shared") {
    return (
      <div className="flex gap-2">
        <Button variant="brass" className="flex-1" onClick={onEditRoute}>
          <Pencil /> {t("remix")}
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/new">
            <Plus /> {t("createOwn")}
          </Link>
        </Button>
      </div>
    );
  }

  if (variant === "own") {
    return (
      <div className="flex gap-2">
        <Button variant="brass" className="flex-1" onClick={onEditRoute}>
          <Pencil /> {t("edit")}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onShare}
          disabled={sharing}
        >
          <Share2 /> {sharing ? t("sharing") : t("share")}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="brass" onClick={onEditRoute}>
      <Pencil /> {t("editRoute")}
    </Button>
  );
}

const tileClass =
  "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium text-ink-soft transition-colors outline-none hover:bg-accent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-[18px]";

function Tile({
  icon,
  label,
  onClick,
  href,
  pressed,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick?: () => void;
  readonly href?: string;
  readonly pressed?: boolean;
}) {
  const content = (
    <>
      {icon}
      <span className="truncate">{label}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={tileClass}>
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(tileClass, pressed && "bg-accent text-brass-text")}
    >
      {content}
    </button>
  );
}

/** Labeled secondary tools, one row: never icon-only. */
export function SecondaryActions({
  variant,
  tool,
  onTool,
  onPoster,
  onCalendar,
  onNavigate,
  onEditRoute,
}: {
  readonly variant: ExperienceVariant;
  readonly tool: ToolId | null;
  readonly onTool: (tool: ToolId) => void;
  readonly onPoster: () => void;
  /** Present for dated trips: downloads the stops as calendar events. */
  readonly onCalendar?: () => void;
  /** Opens the route in a maps app (Google Maps directions). */
  readonly onNavigate: () => void;
  readonly onEditRoute: () => void;
}) {
  const t = useTranslations("Trip.actions");
  return (
    <nav aria-label={t("tools")} className="flex justify-between gap-1 [&>*]:flex-1">
      {variant === "demo" && (
        <Tile icon={<Pencil />} label={t("customize")} onClick={onEditRoute} />
      )}
      {variant !== "shared" && (
        <Tile icon={<Map />} label={t("myMaps")} href="/maps" />
      )}
      <Tile
        icon={<Backpack />}
        label={t("packing")}
        pressed={tool === "packing"}
        onClick={() => onTool("packing")}
      />
      <Tile
        icon={<NotebookPen />}
        label={t("notes")}
        pressed={tool === "notes"}
        onClick={() => onTool("notes")}
      />
      <Tile icon={<ImageDown />} label={t("poster")} onClick={onPoster} />
      {onCalendar && (
        <Tile icon={<CalendarPlus />} label={t("calendar")} onClick={onCalendar} />
      )}
      {variant !== "demo" && (
        <Tile icon={<Navigation />} label={t("navigate")} onClick={onNavigate} />
      )}
    </nav>
  );
}
