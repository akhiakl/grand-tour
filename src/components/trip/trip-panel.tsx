"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState, type ReactNode } from "react";

import { LegalLinks } from "@/components/legal/legal-links";
import { ReportMapLink } from "@/components/legal/report-map-link";
import { usePageIdle } from "@/hooks/use-page-idle";
import { stopDates, tripMapsUrl, type Trip, type TripToolsScope } from "@/lib/trip";

import type { MapInsets } from "./fit-padding";
import {
  PrimaryActions,
  SecondaryActions,
  type ExperienceVariant,
  type ToolId,
} from "./panel-actions";
import { PanelHead } from "./panel-head";
import { PanelShell } from "./panel-shell";
import { Itinerary, StatsGrid } from "./route-overview";
import { SharedLinkNote } from "./shared-link-note";
import { downloadTripCalendar } from "./trip-calendar";

// Neither is on screen at first paint: a stop's detail opens on demand and
// the tools wait for idle, so their code stays out of the startup bundle.
const CityDetail = dynamic(() =>
  import("./city-detail").then((mod) => mod.CityDetail),
);
const TripTools = dynamic(() => import("./trip-tools").then((mod) => mod.TripTools));

/**
 * Everything about the trip that isn't the map: title, actions, stats and
 * itinerary, swapping in a stop's detail or a tool (packing, notes) in
 * place of the itinerary. ESC steps back out of either, then collapses
 * the mobile sheet.
 */
export function TripPanel({
  trip,
  toolsScope,
  views,
  variant,
  cta,
  selected,
  onSelect,
  hovered,
  onHover,
  onEditRoute,
  onShare,
  sharing,
  onPoster,
  onInsetsChange,
  expanded,
  onExpandedChange,
}: {
  readonly trip: Trip;
  /** Where this viewer's packing ticks and notes are saved. */
  readonly toolsScope: TripToolsScope;
  readonly views?: number;
  readonly variant: ExperienceVariant;
  readonly cta?: ReactNode;
  readonly selected: number | null;
  readonly onSelect: (index: number | null) => void;
  /** The stop under the pointer (or focus), on the map or in the list. */
  readonly hovered: number | null;
  readonly onHover: (index: number | null) => void;
  readonly onEditRoute: () => void;
  readonly onShare?: () => void;
  readonly sharing?: boolean;
  readonly onPoster: () => void;
  readonly onInsetsChange: (insets: MapInsets) => void;
  /** Mobile sheet state; picking a stop opens it (see TripExperience). */
  readonly expanded: boolean;
  readonly onExpandedChange: (expanded: boolean) => void;
}) {
  const t = useTranslations("Trip.panel");
  const [tool, setTool] = useState<ToolId | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const bodyId = useId();
  const idle = usePageIdle();
  const city = selected === null ? null : trip.cities[selected];
  const dates = stopDates(trip);

  // A newly picked stop (from the map or the itinerary) takes over the
  // panel from any open tool, unfolding a collapsed card to show it.
  // Adjusted during render, React's pattern for state that follows a prop.
  const [shownSelection, setShownSelection] = useState(selected);
  if (selected !== shownSelection) {
    setShownSelection(selected);
    if (selected !== null) {
      setTool(null);
      setCollapsed(false);
    }
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
    setCollapsed(false);
  };

  return (
    <PanelShell
      label={t("label")}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      collapsed={collapsed}
      bodyId={bodyId}
      onInsetsChange={onInsetsChange}
      head={
        <PanelHead
          trip={trip}
          variant={variant}
          collapsed={collapsed}
          bodyId={bodyId}
          onCollapsedChange={setCollapsed}
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
            dates={dates?.[selected]}
            onBack={() => onSelect(null)}
          />
        )}
        {/* Mounted once idle (or when a tool opens), then kept, so ticks and
            notes survive a detour to a stop. */}
        {(idle || tool) && (
          <TripTools
            trip={trip}
            scope={toolsScope}
            active={city ? null : tool}
            onBack={() => setTool(null)}
          />
        )}
        {!city && !tool && (
          <>
            <SecondaryActions
              variant={variant}
              tool={tool}
              onTool={openTool}
              onPoster={onPoster}
              onCalendar={dates ? () => downloadTripCalendar(trip) : undefined}
              onNavigate={() => window.open(tripMapsUrl(trip), "_blank", "noopener")}
              onEditRoute={onEditRoute}
            />
            <StatsGrid trip={trip} />
            <section aria-label={t("routeLabel")} className="flex flex-col gap-2">
              <p className="eyebrow">{t("theRoute")}</p>
              <Itinerary
                trip={trip}
                selectedIndex={selected}
                onSelect={onSelect}
                hoveredIndex={hovered}
                onHover={onHover}
              />
            </section>
            {variant === "shared" && <SharedLinkNote views={views} />}
            <LegalLinks className="border-t border-line pt-4">
              {variant === "shared" && <ReportMapLink />}
            </LegalLinks>
          </>
        )}
      </div>
    </PanelShell>
  );
}
