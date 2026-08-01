"use client";

import { Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GUEST_MAX_CITIES } from "@/lib/trip";

const LOCKED_FEATURES = [
  "Up to 15 stops per route",
  "Permanent, un-expiring links",
  "Poster export as PDF",
  "Custom map themes",
];

export function UpsellModal({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-brass/10 text-brass">
            <Lock className="size-5" />
          </div>
          <DialogTitle>You&apos;ve reached the guest limit</DialogTitle>
          <DialogDescription>
            Guest routes top out at {GUEST_MAX_CITIES} stops. Sign up for the full
            atlas — coming soon.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          {LOCKED_FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-ink-soft"
            >
              <Check className="size-4 shrink-0 text-brass" />
              {feature}
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep exploring
          </Button>
          <Button variant="brass" disabled>
            Sign up — coming soon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
