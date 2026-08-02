"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ShareDialog } from "@/components/share/share-dialog";
import { UpsellModal } from "@/components/upsell/upsell-modal";
import { useShareTrip } from "@/hooks/use-share-trip";
import { readAndClearAiHandoff } from "@/lib/ai";
import {
  addCity,
  canAddCity,
  createBlankDraft,
  draftFromTrip,
  draftToTrip,
  getLocalTrip,
  isShareable,
  moveCity,
  removeCityAt,
  saveLocalTrip,
  updateCityAt,
  updateLegAt,
  updateTitle,
  type City,
  type DraftTrip,
  type Leg,
} from "@/lib/trip";

import { EditorHeader } from "./editor-header";
import { EditorMapPreview } from "./editor-map-preview";
import { StopList } from "./stop-list";

const AUTOSAVE_DEBOUNCE_MS = 600;

function resolveInitialState(searchParams: URLSearchParams) {
  const remixId = searchParams.get("remix");
  if (remixId) {
    const record = getLocalTrip(remixId);
    if (record) {
      return {
        draft: draftFromTrip(record.trip),
        localId: remixId,
        createdAt: record.trip.createdAt,
      };
    }
  }

  if (searchParams.get("from") === "ai") {
    const aiTrip = readAndClearAiHandoff();
    if (aiTrip) {
      return {
        draft: { title: aiTrip.title, cities: aiTrip.cities, legs: aiTrip.legs },
        localId: null,
        createdAt: Date.now(),
      };
    }
  }

  return { draft: createBlankDraft(), localId: null, createdAt: Date.now() };
}

export function EditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [initial] = useState(() => resolveInitialState(searchParams));

  const [draft, setDraft] = useState<DraftTrip>(initial.draft);
  const [localId, setLocalId] = useState(initial.localId);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [createdAt] = useState(initial.createdAt);

  const { share, sharing, shareId, dialogOpen, setDialogOpen } = useShareTrip({
    onCityLimit: () => setUpsellOpen(true),
  });

  useEffect(() => {
    if (!isShareable(draft)) return;
    const trip = draftToTrip(draft, createdAt);
    if (!trip) return;

    const timer = setTimeout(() => {
      const id = saveLocalTrip(trip, localId ?? undefined);
      if (!localId) {
        setLocalId(id);
        router.replace(`/new?remix=${id}`, { scroll: false });
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [draft, localId, createdAt, router]);

  const update = (fn: (draft: DraftTrip) => DraftTrip) => setDraft(fn);

  const handleShare = () => {
    const trip = draftToTrip(draft, createdAt);
    if (trip) void share(trip);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <EditorHeader
        title={draft.title}
        onTitleChange={(title) => update((d) => updateTitle(d, title))}
        onShare={handleShare}
        canShare={isShareable(draft)}
        sharing={sharing}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_26rem]">
        <StopList
          cities={draft.cities}
          legs={draft.legs}
          canAddCity={canAddCity(draft)}
          onLimitReached={() => setUpsellOpen(true)}
          onAddCity={(city: City) => update((d) => addCity(d, city))}
          onRemoveCity={(index) => update((d) => removeCityAt(d, index))}
          onMoveCity={(from, to) => update((d) => moveCity(d, from, to))}
          onUpdateCity={(index, patch) =>
            update((d) => updateCityAt(d, index, patch))
          }
          onUpdateLeg={(index, patch: Partial<Leg>) =>
            update((d) => updateLegAt(d, index, patch))
          }
        />

        <div className="relative isolate order-first h-64 overflow-hidden rounded-2xl border border-line lg:sticky lg:top-8 lg:order-none lg:h-[32rem]">
          <EditorMapPreview draft={draft} />
        </div>
      </div>

      <ShareDialog
        shareId={shareId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <UpsellModal open={upsellOpen} onOpenChange={setUpsellOpen} />
    </div>
  );
}
