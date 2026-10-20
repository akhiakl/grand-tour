"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMounted } from "@/hooks/use-mounted";
import { SHARE_TTL_DAYS } from "@/lib/trip";

/**
 * Shown after a successful share: the copyable `/t/{id}` link, plus the
 * device's own share sheet where the browser offers one (mostly mobile).
 */
export function ShareDialog({
  shareId,
  title,
  open,
  onOpenChange,
}: {
  readonly shareId: string | null;
  /** The trip title, offered to the share sheet alongside the link. */
  readonly title?: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useMounted() && typeof navigator.share === "function";
  const url =
    shareId && typeof window !== "undefined"
      ? `${window.location.origin}/t/${shareId}`
      : "";

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Map shared — link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy the link manually.");
    }
  };

  const nativeShare = async () => {
    if (!url) return;
    // A dismissed sheet rejects with AbortError; nothing to report.
    await navigator.share({ url, title }).catch(() => undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">Ready to travel</p>
          <DialogTitle>Your map is live</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the route. It stays live for{" "}
            {SHARE_TTL_DAYS} days after its last visit; share again after editing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input readOnly value={url} onFocus={(e) => e.target.select()} />
          <Button type="button" variant="brass" onClick={copy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        {canNativeShare && (
          <Button type="button" variant="outline" onClick={nativeShare}>
            <Share2 /> Share via…
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
