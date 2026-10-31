import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { privacyLink } from "@/components/rich-text";
import { GUEST_MAX_CITIES, SHARE_TTL_DAYS } from "@/lib/trip";

const QUESTIONS = ["free", "account", "links", "ai", "data"] as const;

/** Plain questions and answers; native disclosure, keyboard-ready. */
export function AboutFaq() {
  const t = useTranslations("About.faq");
  return (
    <section
      aria-labelledby="faq-title"
      className="page-container grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8"
    >
      <div className="flex flex-col gap-4 lg:sticky lg:top-12 lg:self-start">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2
          id="faq-title"
          className="font-display text-section font-medium tracking-tight text-balance text-ink"
        >
          {t("title")}
        </h2>
      </div>
      <div className="flex flex-col divide-y divide-line border-y border-line">
        {QUESTIONS.map((key) => (
          <details key={key} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm font-display text-title text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {t(`${key}.q`)}
              <ChevronDown
                aria-hidden
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">
              {t.rich(`${key}.a`, {
                max: GUEST_MAX_CITIES,
                days: SHARE_TTL_DAYS,
                link: privacyLink,
              })}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
