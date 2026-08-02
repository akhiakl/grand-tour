"use client";

import { Check, Copy } from "lucide-react";
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

/** Shown after a successful share: the copyable `/t/{id}` link. */
export function ShareDialog({
  shareId,
  open,
  onOpenChange,
}: {
  readonly shareId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">Ready to travel</p>
          <DialogTitle>Your map is live</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the route. It stays live for 60 days after
            its last visit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input readOnly value={url} onFocus={(e) => e.target.select()} />
          <Button type="button" variant="brass" onClick={copy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
