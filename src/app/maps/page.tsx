import type { Metadata } from "next";

import { MapsPage } from "@/components/maps/maps-page";

export const metadata: Metadata = {
  title: "My Maps",
};

export default function Page() {
  return <MapsPage />;
}
