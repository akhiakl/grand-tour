"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";

import { consumeAiHandoff, createBlankTrip, getLocalTrip } from "@/lib/trip";
import type { Trip } from "@/lib/trip";

import { EditorExperience } from "./editor-experience";
import { EditorSkeleton } from "./editor-skeleton";

interface ResolvedDraft {
  trip: Trip;
  id?: string;
}

/** Resolves the editor's starting point: a remix of a local trip, an AI handoff, or blank. */
function resolveInitialDraft(
  remixId: string | null,
  fromAi: boolean,
): ResolvedDraft {
  if (remixId) {
    const existing = getLocalTrip(remixId);
    if (existing) return { trip: existing, id: remixId };
  }
  if (fromAi) {
    const handoff = consumeAiHandoff();
    if (handoff) return { trip: handoff };
  }
  return { trip: createBlankTrip() };
}

const emptySubscribe = () => () => {};

export function NewEditorPage() {
  const searchParams = useSearchParams();
  const remixId = searchParams.get("remix");
  const fromAi = searchParams.get("from") === "ai";

  // True after hydration only — local trips and the AI handoff live in
  // localStorage, unknowable during SSR.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const draft = useMemo<ResolvedDraft | null>(
    () => (mounted ? resolveInitialDraft(remixId, fromAi) : null),
    [mounted, remixId, fromAi],
  );

  if (!draft) return <EditorSkeleton />;

  return <EditorExperience initialTrip={draft.trip} initialId={draft.id} />;
}
