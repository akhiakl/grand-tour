import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { emphasis, privacyLink, termsLink } from "@/components/rich-text";

/** EU AI Act Art. 50: say up front that the planner is an AI. */
export function AiNotice() {
  const t = useTranslations("Legal");
  return (
    <p className="flex gap-2 rounded-2xl border border-line px-4 py-3 text-xs text-ink-soft">
      <Sparkles aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brass-text" />
      <span>{t.rich("aiNotice", { strong: emphasis })}</span>
    </p>
  );
}

/**
 * Puts the Terms in front of people at the moment they act, which is what
 * makes them binding without accounts or a sign-up checkbox.
 */
export function TermsNotice({
  action,
}: {
  readonly action: "sharing" | "drafting";
}) {
  const t = useTranslations("Legal");
  return (
    <p className="text-xs text-muted-foreground">
      {t.rich("termsNotice", {
        action: t(`termsActions.${action}`),
        terms: termsLink,
        privacy: privacyLink,
      })}
    </p>
  );
}
