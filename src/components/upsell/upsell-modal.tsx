"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { GUEST_MAX_CITIES, SHARE_TTL_DAYS } from "@/lib/trip";

const LOCKED_FEATURES = ["stops", "permanent", "pdf", "themes"] as const;

/**
 * Guest-limit upsell — a Phase 2 teaser, not a real signup flow (see
 * CLAUDE.md Phase 2 non-goals). Fires wherever a guest hits a locked
 * ceiling: the editor's 5th-stop add, My Maps, and AI ghost stops.
 */
export function UpsellModal({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Upsell");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">{t("eyebrow")}</p>
          <DialogTitle>{t("title", { max: GUEST_MAX_CITIES })}</DialogTitle>
          <DialogDescription>
            {t("description", { max: GUEST_MAX_CITIES, days: SHARE_TTL_DAYS })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {LOCKED_FEATURES.map((feature) => (
            <Badge key={feature} variant="outline">
              <Lock /> {t(`features.${feature}`)}
            </Badge>
          ))}
        </div>

        <DialogFooter>
          <Button variant="brass" onClick={() => onOpenChange(false)}>
            {t("dismiss")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
