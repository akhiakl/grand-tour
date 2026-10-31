import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LEGAL_LAST_UPDATED } from "@/lib/legal";

import { SiteFooter } from "./site-footer";

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly body: ReactNode;
}

/**
 * The shared frame for Privacy, Terms and Contact: a readable column on
 * paper, a plain-language summary first, and a sticky contents list from
 * `lg`. Running text is styled here so the pages stay plain JSX.
 */
export function LegalPage({
  eyebrow,
  title,
  summary,
  sections,
  updated = true,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: ReactNode;
  readonly sections: readonly LegalSection[];
  /** Policies show their revision date; the contact page doesn't. */
  readonly updated?: boolean;
}) {
  const t = useTranslations("Legal");
  const common = useTranslations("Common");
  return (
    <div className="flex min-h-dvh flex-col">
      <nav aria-label={common("backToAtlas")} className="page-container">
        <div className="flex h-16 items-center">
          <Link
            href="/"
            className="eyebrow inline-flex items-center gap-1.5 rounded-sm text-muted-foreground transition-colors outline-none hover:text-brass-text focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden className="size-3.5" /> {common("backToAtlas")}
          </Link>
        </div>
      </nav>
      <main className="page-container grid flex-1 gap-12 py-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-8 lg:py-20">
        <header className="flex flex-col gap-4 border-b border-line pb-12 lg:col-span-2 lg:pb-16">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="font-display text-display font-medium tracking-tight text-balance text-ink">
            {title}
          </h1>
          {updated && (
            <p className="text-muted-foreground">
              {t("lastUpdated", { date: LEGAL_LAST_UPDATED })}
            </p>
          )}
        </header>

        <nav aria-label={t("onThisPage")} className="hidden lg:block">
          <ol className="sticky top-12 flex flex-col gap-3 border-l border-line pl-5 text-ink-soft">
            {sections.map(({ id, title: label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="rounded-sm transition-colors outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="flex max-w-[68ch] min-w-0 flex-col gap-14 leading-relaxed text-ink-soft [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_li]:mt-1.5 [&_section>*+*]:mt-3 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5">
          <div className="rounded-2xl border border-line bg-card-solid p-6 text-lead text-ink sm:p-8">
            {summary}
          </div>
          {sections.map(({ id, title: heading, body }) => (
            <section
              key={id}
              id={id}
              aria-labelledby={`${id}-title`}
              className="scroll-mt-12"
            >
              <h2
                id={`${id}-title`}
                className="font-display text-title font-medium tracking-tight text-ink"
              >
                {heading}
              </h2>
              {body}
            </section>
          ))}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
