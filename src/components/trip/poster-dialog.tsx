"use client";

import { Download, Printer, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUnits } from "@/components/units/units-provider";
import { tripFileSlug, tripStats, type Trip } from "@/lib/trip";

import {
  drawPoster,
  type PosterCopy,
  type PosterFonts,
  type PosterTheme,
} from "./draw-poster";

function readTheme(): PosterTheme {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    paper: token("--paper"),
    ink: token("--ink"),
    inkSoft: token("--ink-soft"),
    brass: token("--brass"),
    azure: token("--azure"),
    line: token("--line"),
    cardSolid: token("--card-solid"),
    mapFilter: token("--map-filter"),
  };
}

async function readFonts(): Promise<PosterFonts> {
  const probe = document.createElement("span");
  probe.className = "font-display";
  probe.textContent = "probe";
  document.body.appendChild(probe);
  const display = getComputedStyle(probe).fontFamily;
  probe.remove();
  const sans = getComputedStyle(document.body).fontFamily;

  await Promise.all([
    document.fonts.load(`500 76px ${display}`),
    document.fonts.load(`italic 500 76px ${display}`),
    document.fonts.load(`400 28px ${sans}`),
  ]).catch(() => undefined);
  await document.fonts.ready;

  return { display, sans };
}

function PosterPreview({
  url,
  failed,
  title,
}: {
  readonly url: string | null;
  readonly failed: boolean;
  readonly title: string;
}) {
  const t = useTranslations("Trip.poster");
  if (url) {
    return (
      // Freshly drawn on a canvas — a plain img is the right tool here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={t("alt", { title })}
        className="max-h-[55dvh] w-auto rounded-lg border border-line shadow-soft"
      />
    );
  }
  if (failed) {
    return (
      <p role="alert" className="max-w-xs text-center text-sm text-ink-soft">
        {t("failed")}
      </p>
    );
  }
  return <div className="h-64 w-52 animate-pulse rounded-lg bg-muted" />;
}

export function PosterDialog({
  trip,
  open,
  onOpenChange,
}: {
  readonly trip: Trip;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [failed, setFailed] = useState(false);
  const { money, distance } = useUnits();
  const t = useTranslations("Trip.poster");
  const perPersonText = useTranslations("Trip");
  const stats = tripStats(trip);
  const eyebrow = t("eyebrow");
  const summary = t("summary", {
    nights: stats.nights,
    cities: stats.cities,
    countries: stats.countries,
    distance: distance(stats.totalKm),
  });
  const perPerson = perPersonText("perPerson", { amount: money(stats.budget) });
  const brand = t("brand");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    const render = async () => {
      const fonts = await readFonts();
      const canvas = document.createElement("canvas");
      const copy: PosterCopy = { eyebrow, summary, perPerson, brand };
      await drawPoster(canvas, trip, readTheme(), fonts, copy);
      const rendered = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (cancelled) return;
      if (!rendered) throw new Error("poster encoding failed");

      objectUrl = URL.createObjectURL(rendered);
      setBlob(rendered);
      setUrl(objectUrl);

      const file = new File([rendered], `${tripFileSlug(trip.title)}-route.png`, {
        type: "image/png",
      });
      setCanShare(navigator.canShare?.({ files: [file] }) ?? false);
    };

    render().catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setBlob(null);
      setUrl(null);
      setFailed(false);
    };
  }, [open, trip, eyebrow, summary, perPerson, brand]);

  const download = () => {
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${tripFileSlug(trip.title)}-route.png`;
    anchor.click();
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], `${tripFileSlug(trip.title)}-route.png`, {
      type: "image/png",
    });
    await navigator
      .share({ files: [file], title: trip.title })
      .catch(() => undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-64 place-items-center">
          <PosterPreview url={url} failed={failed} title={trip.title} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer /> {t("print")}
          </Button>
          {canShare && (
            <Button variant="outline" onClick={share} disabled={!blob}>
              <Share2 /> {t("share")}
            </Button>
          )}
          <Button variant="brass" onClick={download} disabled={!url}>
            <Download /> {t("download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
