import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { OffTheMap } from "@/components/off-the-map";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.offline");
  return { title: t("title"), robots: { index: false } };
}

/** Served by the service worker for pages that weren't saved before going offline. */
export default async function OfflinePage() {
  const t = await getTranslations("Errors.offline");
  return (
    <OffTheMap title={t("title")} action={{ href: "/", label: t("action") }}>
      {t("body")}
    </OffTheMap>
  );
}
