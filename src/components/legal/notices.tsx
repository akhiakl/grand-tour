import { Sparkles } from "lucide-react";
import Link from "next/link";

const linkClass = "underline underline-offset-2 hover:text-ink";

/** EU AI Act Art. 50: say up front that the planner is an AI. */
export function AiNotice() {
  return (
    <p className="flex gap-2 rounded-2xl border border-line px-4 py-3 text-xs text-ink-soft">
      <Sparkles aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brass-text" />
      <span>
        <strong className="font-medium text-ink">
          You&apos;re planning with an AI.
        </strong>{" "}
        Its suggestions can be wrong or out of date. Check prices, visas, opening
        hours and safety advice before you travel.
      </span>
    </p>
  );
}

/**
 * Puts the Terms in front of people at the moment they act, which is what
 * makes them binding without accounts or a sign-up checkbox.
 */
export function TermsNotice({ action }: { readonly action: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      By {action} you agree to the{" "}
      <Link href="/terms" className={linkClass}>
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className={linkClass}>
        Privacy notice
      </Link>
      .
    </p>
  );
}
