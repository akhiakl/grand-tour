"use client";

import { ChevronUp, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

import { UnitsButton } from "@/components/units/units-button";
import { useUnits } from "@/components/units/units-provider";
import { useMounted } from "@/hooks/use-mounted";
import { tripStats, type Trip } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { TitleWithAccent } from "./intro-splash";
import type { ExperienceVariant } from "./panel-actions";

function ThemeToggle() {
  const t = useTranslations("Theme");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? t("toLight") : t("toDark")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors outline-none hover:bg-accent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
}

/** Desktop only: folds the atlas card down to this head, and back. */
function CollapseToggle({
  collapsed,
  controls,
  onToggle,
}: {
  readonly collapsed: boolean;
  readonly controls: string;
  readonly onToggle: () => void;
}) {
  const t = useTranslations("Trip.panel");
  return (
    <button
      type="button"
      aria-expanded={!collapsed}
      aria-controls={controls}
      aria-label={collapsed ? t("expandCard") : t("collapseCard")}
      title={collapsed ? t("expandHint") : t("collapseHint")}
      onClick={onToggle}
      className="hidden size-10 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors outline-none hover:bg-accent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring lg:grid [&_svg]:size-4"
    >
      <ChevronUp
        aria-hidden
        className={cn(
          "transition-transform duration-300 ease-atlas motion-reduce:transition-none",
          collapsed && "rotate-180",
        )}
      />
    </button>
  );
}

/**
 * Always-visible top of the panel (the resting mobile sheet shows only
 * this): what the map is, the route at a glance, and the main actions.
 */
export function PanelHead({
  trip,
  variant,
  actions,
  collapsed,
  bodyId,
  onCollapsedChange,
}: {
  readonly trip: Trip;
  readonly variant: ExperienceVariant;
  readonly actions: ReactNode;
  /** Desktop card fold state, and the body element it hides. */
  readonly collapsed: boolean;
  readonly bodyId: string;
  readonly onCollapsedChange: (collapsed: boolean) => void;
}) {
  const t = useTranslations("Trip.panel");
  const stats = tripStats(trip);
  const { distance } = useUnits();

  return (
    <header className="flex flex-col gap-3 px-5 pt-2 pb-4 lg:px-7 lg:pt-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{t(`eyebrow.${variant}`)}</p>
          <h1 className="truncate font-display text-2xl font-medium tracking-tight lg:text-[30px] lg:leading-tight lg:whitespace-normal">
            <TitleWithAccent title={trip.title} />
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft lg:hidden">
            {t("headline", {
              nights: stats.nights,
              cities: stats.cities,
              distance: distance(stats.totalKm),
            })}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <UnitsButton />
          <ThemeToggle />
          <CollapseToggle
            collapsed={collapsed}
            controls={bodyId}
            onToggle={() => onCollapsedChange(!collapsed)}
          />
        </div>
      </div>
      {actions}
    </header>
  );
}
