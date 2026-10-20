import { PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * The landing's way in, shown as the example route's main actions in the
 * trip panel: draft a route with AI or build one by hand.
 */
export function LandingCta() {
  const t = useTranslations("Landing");
  return (
    <div role="group" aria-label={t("group")} className="flex gap-2">
      <Button asChild variant="brass" className="flex-1">
        <Link href="/plan">
          <Sparkles /> {t("planWithAi")}
        </Link>
      </Button>
      <Button asChild variant="outline" className="flex-1">
        <Link href="/new">
          <PenLine /> {t("buildManually")}
        </Link>
      </Button>
    </div>
  );
}
