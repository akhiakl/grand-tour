import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { EditorPage } from "@/components/editor/editor-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.new");
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false },
  };
}

export default function NewPage() {
  return (
    <Suspense fallback={null}>
      <EditorPage />
    </Suspense>
  );
}
