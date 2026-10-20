"use client";

import { useEffect, useState, type ReactNode } from "react";

import type { Trip } from "@/lib/trip";

import { CityDetail } from "./city-detail";
import {
  PrimaryActions,
  SecondaryActions,
  type ExperienceVariant,
  type ToolId,
} from "./panel-actions";
import { PanelHead } from "./panel-head";
import { PanelShell } from "./panel-shell";
import { Itinerary, StatsGrid } from "./route-overview";
import { TripTools } from "./trip-tools";

/**
 * Everything about the trip that isn't the map: title, actions, stats and
 * itinerary, swapping in a stop's detail or a tool (packing, notes) in
 * place of the itinerary. ESC steps back out of either, then collapses
 * the mobile sheet.
 */
export function TripPanel({
  trip,
  variant,
  cta,
  selected,
  onSelect,
  onEditRoute,
  onShare,
  sharing,
  onPoster,
  onInsetChange,
  expanded,
  onExpandedChange,
}: {
  readonly trip: Trip;
  readonly variant: ExperienceVariant;
  readonly cta?: ReactNode;
  readonly selected: number | null;
  readonly onSelect: (index: number | null) => void;
  readonly onEditRoute: () => void;
  readonly onShare?: () => void;
  readonly sharing?: boolean;
  readonly onPoster: () => void;
  readonly onInsetChange: (px: number) => void;
  /** Mobile sheet state; picking a stop opens it (see TripExperience). */
  readonly expanded: boolean;
  readonly onExpandedChange: (expanded: boolean) => void;
}) {
  const [tool, setTool] = useState<ToolId | null>(null);
  const city = selected === null ? null : trip.cities[selected];

  // A newly picked stop (from the map or the itinerary) takes over the
  // panel from any open tool. Adjusted during render, React's pattern for
  // state that follows a prop.
  const [shownSelection, setShownSelection] = useState(selected);
  if (selected !== shownSelection) {
    setShownSelection(selected);
    if (selected !== null) setTool(null);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Dialogs (poster, share) own their own Escape.
      if ((event.target as Element | null)?.closest?.('[role="dialog"]')) return;
      if (selected !== null) onSelect(null);
      else if (tool) setTool(null);
      else onExpandedChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selected, tool, onSelect, onExpandedChange]);

  const openTool = (next: ToolId) => {
    onSelect(null);
    setTool((current) => (current === next ? null : next));
    onExpandedChange(true);
  };

  return (
    <PanelShell
      label="Trip details"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      onInsetChange={onInsetChange}
      head={
        <PanelHead
          trip={trip}
          variant={variant}
          actions={
            <PrimaryActions
              variant={variant}
              cta={cta}
              onEditRoute={onEditRoute}
              onShare={onShare}
              sharing={sharing}
            />
          }
        />
      }
    >
      <div className="flex flex-col gap-5 px-5 pb-8 lg:px-7">
        {city && selected !== null && (
          <CityDetail
            city={city}
            index={selected}
            count={trip.cities.length}
            onBack={() => onSelect(null)}
          />
        )}
        {/* Always mounted so ticks and notes survive a detour to a stop. */}
        <TripTools active={city ? null : tool} onBack={() => setTool(null)} />
        {!city && !tool && (
          <>
            <SecondaryActions
              variant={variant}
              tool={tool}
              onTool={openTool}
              onPoster={onPoster}
              onEditRoute={onEditRoute}
            />
            <StatsGrid trip={trip} />
            <section aria-label="Route" className="flex flex-col gap-2">
              <p className="eyebrow">The route</p>
              <Itinerary trip={trip} selectedIndex={selected} onSelect={onSelect} />
            </section>
          </>
        )}
      </div>
    </PanelShell>
  );
}
