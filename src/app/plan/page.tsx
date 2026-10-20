import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AiChat } from "@/components/ai/ai-chat";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.plan");
  return { title: t("title"), description: t("description") };
}

export default async function PlanPage() {
  const t = await getTranslations("Plan");
  const common = await getTranslations("Common");
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass-text"
        >
          <ArrowLeft className="size-3" /> {common("backToAtlas")}
        </Link>
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink">
          {t.rich("title", {
            em: (chunks) => <em className="text-azure">{chunks}</em>,
          })}
        </h1>
        <p className="text-sm text-ink-soft">{t("lede")}</p>
      </header>
      <AiChat />
    </main>
  );
}
