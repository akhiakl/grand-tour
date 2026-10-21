import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { LEGAL_LAST_UPDATED } from "@/lib/legal";

import { LegalLinks } from "./legal-links";

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
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14 lg:py-16">
        <header className="flex flex-col gap-3 lg:col-span-2">
          <Link
            href="/"
            className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass-text"
          >
            <ArrowLeft className="size-3" /> Field Atlas
          </Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {updated && (
            <p className="text-sm text-muted-foreground">
              Last updated {LEGAL_LAST_UPDATED}
            </p>
          )}
        </header>

        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-8 flex flex-col gap-2 text-sm text-ink-soft">
            {sections.map(({ id, title: label }) => (
              <li key={id}>
                <a href={`#${id}`} className="transition-colors hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="flex max-w-prose min-w-0 flex-col gap-10 text-[15px] leading-relaxed text-ink-soft [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_li]:mt-1.5 [&_section>*+*]:mt-3 [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5">
          <div className="rounded-2xl border border-line bg-card-solid p-5 text-ink">
            {summary}
          </div>
          {sections.map(({ id, title: heading, body }) => (
            <section
              key={id}
              id={id}
              aria-labelledby={`${id}-title`}
              className="scroll-mt-8"
            >
              <h2
                id={`${id}-title`}
                className="font-display text-2xl font-medium tracking-tight text-ink"
              >
                {heading}
              </h2>
              {body}
            </section>
          ))}
        </article>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <span>Grand Tour · Map data © OpenStreetMap contributors</span>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
