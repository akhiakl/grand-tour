import type { Metadata } from "next";

import { OffTheMap } from "@/components/off-the-map";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false },
};

/** Served by the service worker for pages that weren't saved before going offline. */
export default function OfflinePage() {
  return (
    <OffTheMap
      title="Out of signal"
      action={{ href: "/", label: "Try the atlas again" }}
    >
      This page wasn&apos;t saved before the connection dropped. Maps you have
      already opened on this device still work offline.
    </OffTheMap>
  );
}
