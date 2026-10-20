import { Eye } from "lucide-react";

import { SHARE_TTL_DAYS } from "@/lib/trip";

/** Shared View footer: how often the link was opened and how long it lasts. */
export function SharedLinkNote({ views }: { readonly views?: number }) {
  return (
    <p className="flex items-start gap-2 border-t border-line pt-4 text-xs text-ink-soft">
      <Eye className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        {views !== undefined && (
          <>
            Opened {views.toLocaleString("en")} time{views === 1 ? "" : "s"}.{" "}
          </>
        )}
        This link stays live for {SHARE_TTL_DAYS} days after its last visit.
      </span>
    </p>
  );
}
