import type { Metadata } from "next";

import { MapViewPage } from "@/components/maps/map-view-page";

export const metadata: Metadata = {
  title: "Your map",
};

export default function Page() {
  return <MapViewPage />;
}
