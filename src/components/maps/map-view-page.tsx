"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { OffTheMap } from "@/components/off-the-map";
import { TripExperience } from "@/components/trip/trip-experience";
import { useMounted } from "@/hooks/use-mounted";
import { getLocalTrip } from "@/lib/trip";

function NotFoundOnThisDevice() {
  const t = useTranslations("Errors.notOnDevice");
  return (
    <OffTheMap title={t("title")} action={{ href: "/maps", label: t("action") }}>
      {t("body")}
    </OffTheMap>
  );
}

/**
 * Map View — the immersive, read-only-ish experience for one of *your*
 * saved local maps (`/maps/[id]`). Entirely client-driven: local trips
 * only exist in this browser's localStorage, so there's no server data
 * to fetch. Distinct from the Shared View (`/t/[id]`), which reads a
 * public Redis snapshot instead.
 */
export function MapViewPage() {
  const { id } = useParams<{ id: string }>();
  const mounted = useMounted();

  if (!mounted) return null;

  const record = getLocalTrip(id);
  if (!record) return <NotFoundOnThisDevice />;

  return <TripExperience trip={record.trip} actions="own" localId={record.id} />;
}
