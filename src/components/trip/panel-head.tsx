"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

import { useMounted } from "@/hooks/use-mounted";
import { tripStats, type Trip } from "@/lib/trip";

import { TitleWithAccent } from "./intro-splash";
import type { ExperienceVariant } from "./panel-actions";

const EYEBROW: Record<ExperienceVariant, string> = {
  demo: "Example route",
  shared: "Shared route",
  own: "Your map",
};

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors outline-none hover:bg-accent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
    >
      {isDark ? <Sun /> : <Moon />}
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
}: {
  readonly trip: Trip;
  readonly variant: ExperienceVariant;
  readonly actions: ReactNode;
}) {
  const stats = tripStats(trip);

  return (
    <header className="flex flex-col gap-3 px-5 pt-2 pb-4 lg:px-7 lg:pt-7">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{EYEBROW[variant]}</p>
          <h1 className="truncate font-display text-2xl font-medium tracking-tight lg:text-[30px] lg:leading-tight lg:whitespace-normal">
            <TitleWithAccent title={trip.title} />
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft lg:hidden">
            {stats.nights} nights · {stats.cities} cities · ~
            {stats.totalKm.toLocaleString("en-US")} km
          </p>
        </div>
        <ThemeToggle />
      </div>
      {actions}
    </header>
  );
}
