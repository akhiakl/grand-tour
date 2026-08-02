"use client";

import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  "15 stops",
  "Permanent links",
  "PDF export",
  "Custom themes",
];

/**
 * Guest-limit upsell — a Phase 2 teaser, not a real signup flow (see
 * CLAUDE.md Phase 2 non-goals). Fires wherever a guest hits a locked
 * ceiling: the editor's 5th-stop add, My Maps, and (later) ghost stops.
 */
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
          <p className="eyebrow">The atlas grows</p>
          <DialogTitle>{GUEST_MAX_CITIES} stops, for now</DialogTitle>
          <DialogDescription>
            Guest maps travel light — {GUEST_MAX_CITIES} cities and a 60-day link.
            Sign up (coming soon) for a longer itinerary and a few more keepsakes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {LOCKED_FEATURES.map((feature) => (
            <Badge key={feature} variant="outline">
              <Lock /> {feature}
            </Badge>
          ))}
        </div>

        <DialogFooter>
          <Button variant="brass" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
