import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";

/** In-voice placeholder while a page reads this browser's saved maps. */
export function PageLoading() {
  const t = useTranslations("Common");
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <output className="flex flex-col items-center gap-3">
        <Compass
          aria-hidden
          className="size-10 text-muted-foreground motion-safe:animate-pulse"
        />
        <span className="eyebrow">{t("loading")}</span>
      </output>
    </main>
  );
}
