import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const linkClass = "underline underline-offset-2 hover:text-ink";

/** EU AI Act Art. 50: say up front that the planner is an AI. */
export function AiNotice() {
  const t = useTranslations("Legal");
  return (
    <p className="flex gap-2 rounded-2xl border border-line px-4 py-3 text-xs text-ink-soft">
      <Sparkles aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brass-text" />
      <span>
        {t.rich("aiNotice", {
          strong: (chunks) => (
            <strong className="font-medium text-ink">{chunks}</strong>
          ),
        })}
      </span>
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
        terms: (chunks) => (
          <Link href="/terms" className={linkClass}>
            {chunks}
          </Link>
        ),
        privacy: (chunks) => (
          <Link href="/privacy" className={linkClass}>
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}
