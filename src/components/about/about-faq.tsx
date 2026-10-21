import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { GUEST_MAX_CITIES } from "@/lib/trip";

const QUESTIONS: readonly { q: string; a: ReactNode }[] = [
  {
    q: "Is it free?",
    a: `Yes. Guest maps are free, with up to ${GUEST_MAX_CITIES} stops each.`,
  },
  {
    q: "Do I need an account?",
    a: "No. Your maps are saved in this browser. Sharing creates a link anyone can open, no sign-up needed.",
  },
  {
    q: "How long do shared links last?",
    a: "A shared map stays live for 60 days after its last view, so links in active use keep working.",
  },
  {
    q: "Is the AI always right?",
    a: "No. It drafts a sensible route, but check transport, prices, visas and opening hours before you book.",
  },
  {
    q: "What happens to my data?",
    a: (
      <>
        Unshared maps never leave your browser. See the{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-ink"
        >
          Privacy notice
        </Link>{" "}
        for what shared maps and the AI planner send to us.
      </>
    ),
  },
];

/** Plain questions and answers; native disclosure, keyboard-ready. */
export function AboutFaq() {
  return (
    <section aria-labelledby="faq-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Questions</p>
        <h2
          id="faq-title"
          className="font-display text-3xl font-medium tracking-tight"
        >
          Before you set off
        </h2>
      </div>
      <div className="flex flex-col divide-y divide-line border-y border-line">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm font-display text-lg text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
