"use client";

import { Ruler } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { usePageIdle } from "@/hooks/use-page-idle";

// Matches the dialog trigger's look; importing that file would pull the
// dialog (Radix Select, Dialog, the currency list) into the startup bundle.
const TRIGGER_CLASS =
  "grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink-soft [&_svg]:size-4";

function Placeholder() {
  const t = useTranslations("Units");
  return (
    <button
      type="button"
      disabled
      aria-label={t("trigger")}
      className={TRIGGER_CLASS}
    >
      <Ruler />
    </button>
  );
}

const UnitsDialog = dynamic(
  () => import("./units-dialog").then((mod) => mod.UnitsDialog),
  { loading: Placeholder },
);

/**
 * The units trigger: a look-alike placeholder at first paint, swapped for
 * the real dialog once the page is idle.
 */
export function UnitsButton() {
  return usePageIdle() ? <UnitsDialog /> : <Placeholder />;
}
