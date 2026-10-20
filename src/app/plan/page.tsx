import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AiChat } from "@/components/ai/ai-chat";

export const metadata: Metadata = {
  title: "Plan with AI",
};

export default function PlanPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass"
        >
          <ArrowLeft className="size-3" /> Field Atlas
        </Link>
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink">
          Plan with the <em className="text-azure">atlas</em>
        </h1>
        <p className="text-sm text-ink-soft">
          Three questions, one drafted route. You edit everything after.
        </p>
      </header>
      <AiChat />
    </main>
  );
}
