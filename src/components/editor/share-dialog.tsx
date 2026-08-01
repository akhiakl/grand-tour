"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function shareUrl(id: string): string {
  if (typeof window === "undefined") return `/t/${id}`;
  return `${window.location.origin}/t/${id}`;
}

export function ShareDialog({
  id,
  open,
  onOpenChange,
}: {
  readonly id: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = id ? shareUrl(id) : "";

  const copy = async () => {
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your route is live</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the route — it stays up for 60 days,
            refreshed each time someone opens it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input value={url} readOnly aria-label="Share link" className="flex-1" />
          <Button type="button" variant="outline" size="icon" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span className="sr-only">Copy link</span>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="brass" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
