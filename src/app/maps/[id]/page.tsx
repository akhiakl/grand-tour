import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MapViewPage } from "@/components/maps/map-view-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.mapView");
  return { title: t("title"), robots: { index: false } };
}

export default function Page() {
  return <MapViewPage />;
}
