"use client";

import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";

import { useMounted } from "@/hooks/use-mounted";
import { reportMapMailto } from "@/lib/legal";

/** Opens a pre-filled report about the map on this page. */
export function ReportMapLink() {
  const t = useTranslations("Legal.report");
  const mounted = useMounted();
  // The address is only known in the browser; before hydration the
  // report still opens, just without the link filled in.
  const mapUrl = mounted
    ? `${window.location.origin}${window.location.pathname}`
    : "";

  return (
    <a
      href={reportMapMailto({
        subject: t("subject", { url: mapUrl }),
        body: t("body", { url: mapUrl }),
      })}
      className="inline-flex items-center gap-1 rounded-sm underline-offset-4 transition-colors outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Flag aria-hidden className="size-3" /> {t("link")}
    </a>
  );
}
