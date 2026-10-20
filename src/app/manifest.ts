import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

import { DEFAULT_LOCALE } from "@/i18n/config";

/** Installable app metadata; colors are the light-theme paper and ink. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "Metadata" });
  const name = (
    await getTranslations({ locale: DEFAULT_LOCALE, namespace: "Common" })
  )("appName");
  return {
    name,
    short_name: name,
    description: t("manifestDescription"),
    start_url: "/",
    display: "standalone",
    background_color: "#F5F1E8",
    theme_color: "#16233A",
    icons: [
      { src: "/icons/mark.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
