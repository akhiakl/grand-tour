import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AiChat } from "@/components/ai/ai-chat";
import { accent } from "@/components/rich-text";
import { destinationFromParam } from "@/lib/ai";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.plan");
  return { title: t("title"), description: t("description") };
}

export default async function PlanPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { destination } = await searchParams;
  const t = await getTranslations("Plan");
  const common = await getTranslations("Common");
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
      <main className="page-container grid flex-1 content-start gap-10 py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-16">
        <header className="flex flex-col gap-4 lg:sticky lg:top-16 lg:self-start">
          <h1 className="font-display text-section font-medium tracking-tight text-balance text-ink">
            {t.rich("title", { em: accent })}
          </h1>
          <p className="max-w-[40ch] text-lead text-ink-soft">{t("lede")}</p>
        </header>
        <div className="min-w-0">
          <AiChat initialDestination={destinationFromParam(destination)} />
        </div>
      </main>
    </div>
  );
}
