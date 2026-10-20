import type { Metadata } from "next";

import { MapViewPage } from "@/components/maps/map-view-page";

export const metadata: Metadata = {
  title: "Your map",
  robots: { index: false },
};

export default function Page() {
  return <MapViewPage />;
}
