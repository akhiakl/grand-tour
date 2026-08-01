"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTripDraft } from "@/hooks/use-trip-draft";
import { TripSchema, saveLocalTrip } from "@/lib/trip";
import type { Trip } from "@/lib/trip";

import { EditorPreview } from "./editor-preview";
import { ShareButton } from "./share-button";
import { StopsList } from "./stops-list";
import { UpsellModal } from "./upsell-modal";

const AUTOSAVE_DEBOUNCE_MS = 600;

export function EditorExperience({
  initialTrip,
  initialId,
}: {
  readonly initialTrip: Trip;
  readonly initialId?: string;
}) {
  const draft = useTripDraft(initialTrip);
  const localIdRef = useRef(initialId);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const debouncedTrip = useDebouncedValue(draft.trip, AUTOSAVE_DEBOUNCE_MS);

  useEffect(() => {
    if (!TripSchema.safeParse(debouncedTrip).success) return;
    localIdRef.current = saveLocalTrip(debouncedTrip, localIdRef.current);
  }, [debouncedTrip]);

  const isShareable = TripSchema.safeParse(draft.trip).success;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-6">
      <div className="flex flex-col gap-6">
        <Link
          href="/maps"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> My Maps
        </Link>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="trip-title" className="eyebrow mb-1.5 block">
              Trip title
            </label>
            <Input
              id="trip-title"
              value={draft.trip.title}
              onChange={(event) => draft.setTitle(event.target.value)}
              placeholder="Grand Tour"
              className="font-display text-lg"
            />
          </div>
          <ShareButton trip={draft.trip} disabled={!isShareable} />
        </div>

        <StopsList
          cities={draft.trip.cities}
          legs={draft.trip.legs}
          stopIds={draft.stopIds}
          atLimit={draft.atLimit}
          onAddCity={draft.addCity}
          onRemoveCity={draft.removeCity}
          onReorderCities={draft.reorderCities}
          onUpdateCity={draft.updateCity}
          onUpdateLeg={draft.updateLeg}
          onLimitReached={() => setUpsellOpen(true)}
        />
      </div>

      <div className="relative h-[50vh] overflow-hidden rounded-2xl border border-line lg:sticky lg:top-6 lg:h-[calc(100dvh-6rem)]">
        <EditorPreview trip={draft.trip} />
      </div>

      <UpsellModal open={upsellOpen} onOpenChange={setUpsellOpen} />
    </div>
  );
}
