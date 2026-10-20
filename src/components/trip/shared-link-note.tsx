import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import { SHARE_TTL_DAYS } from "@/lib/trip";

/** Shared View footer: how often the link was opened and how long it lasts. */
export function SharedLinkNote({ views }: { readonly views?: number }) {
  const t = useTranslations("Trip.sharedNote");
  return (
    <p className="flex items-start gap-2 border-t border-line pt-4 text-xs text-ink-soft">
      <Eye className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        {views !== undefined && <>{t("views", { count: views })} </>}
        {t("expiry", { days: SHARE_TTL_DAYS })}
      </span>
    </p>
  );
}
