import type { Metadata } from "next";

import { MapsPage } from "@/components/maps/maps-page";

export const metadata: Metadata = {
  title: "My Maps",
  description:
    "Every route you have drawn on this device, ready to open, edit or share.",
  robots: { index: false },
};

export default function Page() {
  return <MapsPage />;
}
