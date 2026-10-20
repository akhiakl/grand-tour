"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ShareDialog } from "@/components/share/share-dialog";
import { UpsellModal } from "@/components/upsell/upsell-modal";
import { useMounted } from "@/hooks/use-mounted";
import { useShareTrip } from "@/hooks/use-share-trip";
import { clearAiHandoff, readAiHandoff } from "@/lib/ai";
import {
  addCity,
  canAddCity,
  createBlankDraft,
  draftFromTrip,
  draftIssues,
  draftToTrip,
  getLocalTrip,
  isShareable,
  moveCity,
  removeCityAt,
  saveLocalTrip,
  tripFingerprint,
  updateCityAt,
  updateLegAt,
  updateStartDate,
  updateTitle,
  type City,
  type DraftIssues,
  type Leg,
  type Trip,
} from "@/lib/trip";

import {
  EditorHeader,
  TRIP_START_INPUT_ID,
  TRIP_TITLE_INPUT_ID,
} from "./editor-header";
import { EditorMapPreview } from "./editor-map-preview";
import { StopList } from "./stop-list";
import { useDraftHistory } from "./use-draft-history";

const AUTOSAVE_DEBOUNCE_MS = 600;

/** The input id for an issue key, for fields the editor always shows. */
function fieldIdFor(key: string): string | null {
  if (key === "title") return TRIP_TITLE_INPUT_ID;
  if (key === "startDate") return TRIP_START_INPUT_ID;
  const match = /^cities\.(\d+)\.(name|nights)$/.exec(key);
  return match ? `stop-${match[1]}-${match[2]}` : null;
}

/** Undo group for an edit to one stop's or leg's fields, e.g. "city-2-name". */
const fieldGroup = (kind: string, index: number, patch: object) =>
  `${kind}-${index}-${Object.keys(patch).sort().join(",")}`;

function focusFirstIssue(issues: DraftIssues) {
  for (const key of Object.keys(issues)) {
    const id = fieldIdFor(key);
    const field = id ? document.getElementById(id) : null;
    if (field) {
      field.focus();
      return;
    }
  }
}

function resolveInitialState(searchParams: URLSearchParams) {
  const remixId = searchParams.get("remix");
  if (remixId) {
    const record = getLocalTrip(remixId);
    if (record) {
      return {
        draft: draftFromTrip(record.trip),
        localId: remixId,
        createdAt: record.trip.createdAt,
        ghostNames: [] as string[],
      };
    }
  }

  if (searchParams.get("from") === "ai") {
    const aiTrip = readAiHandoff();
    if (aiTrip) {
      return {
        draft: { title: aiTrip.title, cities: aiTrip.cities, legs: aiTrip.legs },
        localId: null,
        createdAt: Date.now(),
        ghostNames: aiTrip.suggestedExtra,
      };
    }
  }

  return {
    draft: createBlankDraft(),
    localId: null,
    createdAt: Date.now(),
    ghostNames: [] as string[],
  };
}

/**
 * The draft comes from localStorage or the AI handoff, which only exist in
 * the browser — resolve it after mount so server and client HTML agree.
 */
export function EditorPage() {
  return useMounted() ? <EditorWorkspace /> : null;
}

function EditorWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Resolved once: later URL changes (the autosave's ?remix= replace) must
  // not re-read storage or the already-consumed AI handoff.
  const [initial] = useState(() => resolveInitialState(searchParams));

  const { draft, update, undo, redo, canUndo, canRedo } = useDraftHistory(
    initial.draft,
  );
  const [localId, setLocalId] = useState(initial.localId);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [createdAt] = useState(initial.createdAt);

  // The AI draft is now in state; consume the handoff so a later visit to
  // /new?from=ai starts blank. Cleared here, not while rendering (see
  // readAiHandoff).
  useEffect(() => {
    if (searchParams.get("from") === "ai") clearAiHandoff();
  }, [searchParams]);

  const { share, sharing, shareId, sharedTitle, dialogOpen, setDialogOpen } =
    useShareTrip({
      onCityLimit: () => setUpsellOpen(true),
    });

  // Saves the trip locally, adopting the new id (and URL) on first save.
  const persist = useCallback(
    (trip: Trip): string => {
      const id = saveLocalTrip(trip, localId ?? undefined);
      if (!localId) {
        setLocalId(id);
        router.replace(`/new?remix=${id}`, { scroll: false });
      }
      return id;
    },
    [localId, router],
  );

  useEffect(() => {
    if (!isShareable(draft)) return;
    const trip = draftToTrip(draft, createdAt);
    if (!trip) return;

    const timer = setTimeout(() => persist(trip), AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, createdAt, persist]);

  const issues = draftIssues(draft);
  const lastShare = localId ? getLocalTrip(localId)?.shared : undefined;
  const currentTrip = draftToTrip(draft, createdAt);
  const shareStale =
    lastShare !== undefined &&
    currentTrip !== null &&
    tripFingerprint(currentTrip) !== lastShare.fingerprint;

  const handleShare = () => {
    if (Object.keys(issues).length > 0) {
      focusFirstIssue(issues);
      toast.error("A few fields need fixing before this map can be shared.");
      return;
    }
    const trip = draftToTrip(draft, createdAt);
    // Save first so the share is recorded against exactly what was shared.
    if (trip) void share(trip, persist(trip));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <EditorHeader
        title={draft.title}
        onTitleChange={(title) => update((d) => updateTitle(d, title), "title")}
        onShare={handleShare}
        canShare={isShareable(draft)}
        sharing={sharing}
        titleError={issues.title}
        shareStale={shareStale}
        startDate={draft.startDate ?? ""}
        onStartDateChange={(value) =>
          update((d) => updateStartDate(d, value), "startDate")
        }
        history={{ canUndo, canRedo, onUndo: undo, onRedo: redo }}
        startDateError={issues.startDate}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_26rem]">
        <StopList
          cities={draft.cities}
          legs={draft.legs}
          canAddCity={canAddCity(draft)}
          onLimitReached={() => setUpsellOpen(true)}
          issues={issues}
          onAddCity={(city: City) => update((d) => addCity(d, city))}
          onRemoveCity={(index) => update((d) => removeCityAt(d, index))}
          onMoveCity={(from, to) => update((d) => moveCity(d, from, to))}
          onUpdateCity={(index, patch) =>
            update(
              (d) => updateCityAt(d, index, patch),
              fieldGroup("city", index, patch),
            )
          }
          onUpdateLeg={(index, patch: Partial<Leg>) =>
            update(
              (d) => updateLegAt(d, index, patch),
              fieldGroup("leg", index, patch),
            )
          }
        />

        <div className="relative isolate order-first h-64 overflow-hidden rounded-2xl border border-line lg:sticky lg:top-8 lg:order-none lg:h-[32rem]">
          <EditorMapPreview
            draft={draft}
            ghostNames={initial.ghostNames}
            onGhostSelect={() => setUpsellOpen(true)}
          />
        </div>
      </div>

      <ShareDialog
        shareId={shareId}
        title={sharedTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <UpsellModal open={upsellOpen} onOpenChange={setUpsellOpen} />
    </div>
  );
}
