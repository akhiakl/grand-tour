"use client";

import { Download, Share2 } from "lucide-react";
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
import type { Trip } from "@/lib/trip";

import { drawPoster, type PosterFonts, type PosterTheme } from "./draw-poster";

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

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "grand-tour";

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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      const fonts = await readFonts();
      const canvas = document.createElement("canvas");
      drawPoster(canvas, trip, readTheme(), fonts);
      const rendered = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (cancelled || !rendered) return;

      objectUrl = URL.createObjectURL(rendered);
      setBlob(rendered);
      setUrl(objectUrl);

      const file = new File([rendered], `${slug(trip.title)}-route.png`, {
        type: "image/png",
      });
      setCanShare(navigator.canShare?.({ files: [file] }) ?? false);
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setBlob(null);
      setUrl(null);
    };
  }, [open, trip]);

  const download = () => {
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slug(trip.title)}-route.png`;
    anchor.click();
  };

  const share = async () => {
    if (!blob) return;
    const file = new File([blob], `${slug(trip.title)}-route.png`, {
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
          <DialogTitle>Share your route</DialogTitle>
          <DialogDescription>
            A clean poster of the journey — sized for Instagram (4:5), no app chrome,
            follows your theme.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-64 place-items-center">
          {url ? (
            // Freshly drawn on a canvas — a plain img is the right tool here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={`Route poster for ${trip.title}`}
              className="max-h-[55dvh] w-auto rounded-lg border border-line shadow-soft"
            />
          ) : (
            <div className="h-64 w-52 animate-pulse rounded-lg bg-muted" />
          )}
        </div>

        <DialogFooter>
          {canShare && (
            <Button variant="outline" onClick={share} disabled={!blob}>
              <Share2 /> Share…
            </Button>
          )}
          <Button variant="brass" onClick={download} disabled={!url}>
            <Download /> Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
