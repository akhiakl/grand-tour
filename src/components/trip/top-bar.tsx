"use client";

import { Backpack, Download, Moon, NotebookPen, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { cn } from "@/lib/utils";

import { TitleWithAccent } from "./intro-splash";

export type PanelId = "packing" | "notes";

const chipClass =
  "pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium shadow-soft backdrop-blur-lg transition-transform outline-none hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-[15px]";

const emptySubscribe = () => () => {};

function ThemeChip() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={chipClass}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

export function TopBar({
  title,
  eyebrow,
  activePanel,
  onTogglePanel,
}: {
  readonly title: string;
  readonly eyebrow: string;
  readonly activePanel: PanelId | null;
  readonly onTogglePanel: (panel: PanelId) => void;
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 p-4 sm:px-7 sm:py-4">
      <div className="pointer-events-auto leading-tight">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display text-[26px] font-medium tracking-tight">
          <TitleWithAccent title={title} />
        </h1>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={cn(chipClass, activePanel === "packing" && "text-brass")}
          aria-pressed={activePanel === "packing"}
          onClick={() => onTogglePanel("packing")}
        >
          <Backpack />
          <span className="hidden sm:inline">Packing</span>
        </button>
        <button
          type="button"
          className={cn(chipClass, activePanel === "notes" && "text-brass")}
          aria-pressed={activePanel === "notes"}
          onClick={() => onTogglePanel("notes")}
        >
          <NotebookPen />
          <span className="hidden sm:inline">Notes</span>
        </button>
        <button type="button" className={chipClass} onClick={() => window.print()}>
          <Download />
          <span className="hidden sm:inline">Export</span>
        </button>
        <ThemeChip />
      </div>
    </header>
  );
}
