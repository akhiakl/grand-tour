import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MapsPage } from "@/components/maps/maps-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.maps");
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false },
  };
}

export default function Page() {
  return <MapsPage />;
}
